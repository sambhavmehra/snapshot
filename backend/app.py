import os
import io
import base64
import json
import jwt
from datetime import datetime, timedelta
from functools import wraps
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import or_
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
from groq import Groq
from dotenv import load_dotenv
from pypdf import PdfReader

load_dotenv()

app = Flask(__name__)
# Enable CORS for the frontend dev server
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Configuration
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'default-secret-key-super-secure')
basedir = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'snapstudy.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# Models
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(200), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class StudySession(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    image_mime = db.Column(db.String(50), nullable=False)
    image_base64 = db.Column(db.Text, nullable=False)
    analysis_data = db.Column(db.Text, nullable=False) # JSON literal
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class ChatMessage(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    session_id = db.Column(db.Integer, db.ForeignKey('study_session.id'), nullable=False)
    role = db.Column(db.String(20), nullable=False) # 'user' or 'assistant'
    content = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Note(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    session_id = db.Column(db.Integer, db.ForeignKey('study_session.id'), nullable=False, unique=True)
    title = db.Column(db.String(200), nullable=False)
    topic = db.Column(db.String(200), nullable=True)
    manual_content = db.Column(db.Text, nullable=False, default='')
    ai_content = db.Column(db.Text, nullable=False, default='')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class WorkspaceNote(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    session_id = db.Column(db.Integer, db.ForeignKey('study_session.id'), nullable=True)
    note_type = db.Column(db.String(20), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    topic = db.Column(db.String(200), nullable=True)
    content = db.Column(db.Text, nullable=False, default='')
    source_name = db.Column(db.String(255), nullable=True)
    source_mime = db.Column(db.String(100), nullable=True)
    source_base64 = db.Column(db.Text, nullable=True)
    source_text = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class NoteChatMessage(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    note_id = db.Column(db.Integer, db.ForeignKey('workspace_note.id'), nullable=False)
    role = db.Column(db.String(20), nullable=False)
    content = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class AISettings(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False, unique=True)
    perspective = db.Column(db.String(120), nullable=False, default='student')
    tone = db.Column(db.String(120), nullable=False, default='clear and encouraging')
    response_style = db.Column(db.String(120), nullable=False, default='structured notes with examples')
    focus = db.Column(db.String(200), nullable=True, default='')
    custom_instructions = db.Column(db.Text, nullable=True, default='')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

with app.app_context():
    db.create_all()

# Groq Client Setup
groq_client = Groq(api_key=os.environ.get("GROQ_API_KEY", "your-groq-api-key"))
VISION_MODEL = "llama-3.2-90b-vision-preview" # For vision, user actually asked for llama-4-scout but groq vision API has specific models. Let me use llama-3.2-90b-vision-preview if it supports it, wait!
# User strictly said: "use this model for the image analyzing: meta-llama/llama-4-scout-17b-16e-instruct"
VISION_MODEL = "meta-llama/llama-4-scout-17b-16e-instruct"
TEXT_MODEL = "llama-3.3-70b-versatile"

# Auth Middleware
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            if auth_header.startswith('Bearer '):
                token = auth_header.split(" ")[1]
        
        if not token:
            return jsonify({'message': 'Token is missing!'}), 401
        
        try:
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
            current_user = User.query.filter_by(id=data['user_id']).first()
        except Exception as e:
            return jsonify({'message': 'Token is invalid!', 'error': str(e)}), 401
        
        return f(current_user, *args, **kwargs)
    return decorated

# API Routes
@app.route('/api/auth/signup', methods=['POST'])
def signup():
    data = request.get_json()
    if not data or not data.get('email') or not data.get('password') or not data.get('username'):
        return jsonify({'message': 'Missing data'}), 400
    
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'message': 'Email already exists'}), 400

    if User.query.filter_by(username=data['username']).first():
        return jsonify({'message': 'Username already taken'}), 400
        
    try:
        hashed_password = generate_password_hash(data['password'])
        new_user = User(username=data['username'], email=data['email'], password_hash=hashed_password)
        db.session.add(new_user)
        db.session.commit()
        
        token = jwt.encode({
            'user_id': new_user.id,
            'exp': datetime.utcnow() + timedelta(days=7)
        }, app.config['SECRET_KEY'], algorithm="HS256")
        
        return jsonify({
            'message': 'Registered successfully', 
            'token': token,
            'user': {'id': new_user.id, 'username': new_user.username, 'email': new_user.email}
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Server error: ' + str(e)}), 500

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'message': 'Missing data'}), 400
        
    user = User.query.filter_by(email=data['email']).first()
    if not user or not check_password_hash(user.password_hash, data['password']):
        return jsonify({'message': 'Invalid credentials'}), 401
        
    token = jwt.encode({
        'user_id': user.id,
        'exp': datetime.utcnow() + timedelta(days=7)
    }, app.config['SECRET_KEY'], algorithm="HS256")
    
    return jsonify({
        'message': 'Login successful',
        'token': token,
        'user': {'id': user.id, 'username': user.username, 'email': user.email}
    })

@app.route('/api/ai-settings', methods=['GET'])
@token_required
def get_ai_settings(current_user):
    settings = get_or_create_ai_settings(current_user.id)
    return jsonify({"success": True, "settings": serialize_ai_settings(settings)})

@app.route('/api/ai-settings', methods=['PUT'])
@token_required
def update_ai_settings(current_user):
    data = request.get_json() or {}
    settings = get_or_create_ai_settings(current_user.id)
    settings.perspective = (data.get('perspective') or settings.perspective or 'student').strip()
    settings.tone = (data.get('tone') or settings.tone or 'clear and encouraging').strip()
    settings.response_style = (data.get('response_style') or settings.response_style or 'structured notes with examples').strip()
    settings.focus = (data.get('focus') or '').strip()
    settings.custom_instructions = (data.get('custom_instructions') or '').strip()
    settings.updated_at = datetime.utcnow()
    db.session.commit()
    return jsonify({"success": True, "settings": serialize_ai_settings(settings)})

def encode_image(image_bytes):
    return base64.b64encode(image_bytes).decode('utf-8')

def truncate_text(value, limit=12000):
    if not value:
        return ''
    return value[:limit]

def extract_uploaded_text(file_storage):
    filename = secure_filename(file_storage.filename or 'notes-upload')
    mime_type = file_storage.mimetype or 'application/octet-stream'
    file_bytes = file_storage.read()
    base64_file = base64.b64encode(file_bytes).decode('utf-8')
    extracted_text = ''

    if filename.lower().endswith('.pdf') or mime_type == 'application/pdf':
        pdf_reader = PdfReader(io.BytesIO(file_bytes))
        pages = [(page.extract_text() or '').strip() for page in pdf_reader.pages]
        extracted_text = '\n\n'.join(page for page in pages if page)
    elif filename.lower().endswith(('.txt', '.md')) or mime_type.startswith('text/'):
        extracted_text = file_bytes.decode('utf-8', errors='ignore').strip()
    else:
        raise ValueError('Unsupported file type. Upload a PDF, TXT, or MD file.')

    if not extracted_text:
        raise ValueError('We could not extract readable text from that file.')

    return {
        "filename": filename,
        "mime_type": mime_type,
        "base64_file": base64_file,
        "text": extracted_text
    }

def serialize_workspace_note(note):
    return {
        "id": note.id,
        "session_id": note.session_id,
        "type": note.note_type,
        "title": note.title,
        "topic": note.topic or "",
        "content": note.content or "",
        "source_name": note.source_name,
        "source_mime": note.source_mime,
        "source_text_preview": truncate_text(note.source_text, 400),
        "created_at": note.created_at.isoformat() if note.created_at else None,
        "updated_at": note.updated_at.isoformat() if note.updated_at else None
    }

def serialize_note_chat(chat):
    return {
        "id": chat.id,
        "role": chat.role,
        "content": chat.content,
        "created_at": chat.created_at.isoformat() if chat.created_at else None
    }

def get_or_create_ai_settings(user_id):
    settings = AISettings.query.filter_by(user_id=user_id).first()
    if not settings:
        settings = AISettings(user_id=user_id)
        db.session.add(settings)
        db.session.commit()
    return settings

def serialize_ai_settings(settings):
    return {
        "perspective": settings.perspective,
        "tone": settings.tone,
        "response_style": settings.response_style,
        "focus": settings.focus or "",
        "custom_instructions": settings.custom_instructions or "",
    }

def build_ai_preferences_block(settings):
    return f"""
    User AI preferences:
    - Perspective: {settings.perspective}
    - Tone: {settings.tone}
    - Response style: {settings.response_style}
    - Focus: {settings.focus or "general understanding"}
    - Custom instructions: {settings.custom_instructions or "none"}

    Follow these preferences whenever they fit the user's request.
    If the user asks for a different perspective in the message itself, prioritize the user's latest request.
    """

def get_workspace_note_or_404(current_user, note_id):
    return WorkspaceNote.query.filter_by(id=note_id, user_id=current_user.id).first()

def build_workspace_note_context(note):
    context_parts = [
        f"Note title: {note.title}",
        f"Note type: {note.note_type}",
    ]

    if note.topic:
        context_parts.append(f"Topic: {note.topic}")

    if note.content:
        context_parts.append(f"Note content:\n{truncate_text(note.content, 16000)}")

    if note.source_text:
        context_parts.append(f"Uploaded source text:\n{truncate_text(note.source_text, 16000)}")

    if note.session_id:
        session = StudySession.query.filter_by(id=note.session_id, user_id=note.user_id).first()
        if session:
            context_parts.append(f"Linked analysis data:\n{session.analysis_data}")

    return "\n\n".join(context_parts)

def parse_json_response(raw_content):
    cleaned = (raw_content or '').replace("```json", "").replace("```", "").strip()
    return json.loads(cleaned)

def parse_agentic_note_response(raw_content, note):
    cleaned = (raw_content or '').replace("```json", "").replace("```", "").strip()

    try:
        return json.loads(cleaned)
    except Exception:
        pass

    json_start = cleaned.find('{')
    json_end = cleaned.rfind('}')
    if json_start != -1 and json_end != -1 and json_end > json_start:
        candidate = cleaned[json_start:json_end + 1]
        try:
            return json.loads(candidate)
        except Exception:
            pass

    # Fallback: treat the raw model output as a normal reply instead of failing the whole request.
    return {
        "reply": cleaned or "I can help with this note. Try asking me to explain, summarize, or rewrite a section.",
        "should_update_note": False,
        "updated_title": note.title if note else None,
        "updated_topic": note.topic if note else None,
        "updated_content": None,
        "change_summary": None
    }

@app.route('/api/analyze', methods=['POST'])
@token_required
def analyze_image(current_user):
    if 'image' not in request.files:
        return jsonify({"error": "No image provided"}), 400
    
    file = request.files['image']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
    
    try:
        ai_settings = get_or_create_ai_settings(current_user.id)
        image_bytes = file.read()
        mime_type = file.mimetype
        if not mime_type or not mime_type.startswith("image/"):
            mime_type = "image/jpeg"
        base64_image = encode_image(image_bytes)
        
        prompt = """
        Analyze this image for educational purposes. Provide a detailed structured response in VALID JSON format.
        Do NOT wrap the JSON in Markdown backticks. Output ONLY the raw JSON object.
        Structure:
        {
            "object": "Identify the main object, diagram, or text",
            "description": "A very detailed description of what is seen",
            "context": "Contextual educational explanation and underlying concepts",
            "uses": ["Practical use case 1", "Practical use case 2", "Practical use case 3"],
            "advice": "Smart learning suggestions or insights related to this",
            "sensitiveData": "Detect any sensitive information (e.g., passwords, IDs, phone numbers, faces) and provide a short warning. If none, return null."
        }
        """
        prompt += "\n\n" + build_ai_preferences_block(ai_settings)

        messages = [
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": prompt},
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:{mime_type};base64,{base64_image}"
                        }
                    }
                ]
            }
        ]

        response = groq_client.chat.completions.create(
            model=VISION_MODEL,
            messages=messages,
            temperature=0.2,
            max_tokens=800,
        )
        
        content = response.choices[0].message.content
        content = content.replace("```json", "").replace("```", "").strip()
        data = json.loads(content)
        
        # Save to DB
        session = StudySession(
            user_id=current_user.id,
            image_mime=mime_type,
            image_base64=base64_image,
            analysis_data=json.dumps(data)
        )
        db.session.add(session)
        db.session.commit()
        
        return jsonify({
            "success": True, 
            "data": data, 
            "imageContext": base64_image, 
            "imageMime": mime_type,
            "sessionId": session.id
        })

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

@app.route('/api/chat', methods=['POST'])
@token_required
def chat(current_user):
    data = request.json
    messages = data.get('messages', [])
    session_id = data.get('sessionId')

    if not messages or not session_id:
        return jsonify({"error": "No messages or sessionId provided"}), 400

    try:
        ai_settings = get_or_create_ai_settings(current_user.id)
        session = StudySession.query.filter_by(id=session_id, user_id=current_user.id).first()
        if not session:
            return jsonify({"error": "Session not found"}), 404

        image_context = session.image_base64
        image_mime = session.image_mime

        analysis_context = session.analysis_data
        system_prompt = "You are SnapStudy, an expert AI tutor. Use the provided image and its analysis details to answer the user's questions clearly, format your text properly using markdown (bolding, lists, codeblocks)."
        system_prompt += "\n\n" + build_ai_preferences_block(ai_settings)
        if analysis_context:
            system_prompt += f"\n\nHere are the detailed image analysis results we already extracted:\n{analysis_context}"

        groq_messages = []
        groq_messages.append({"role": "system", "content": system_prompt})
        
        if image_context:
            groq_messages.append({
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": "Here is the image we are discussing:"
                    },
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:{image_mime};base64,{image_context}"
                        }
                    }
                ]
            })

        for msg in messages:
            role = "assistant" if msg['role'] == "assistant" else "user"
            groq_messages.append({"role": role, "content": msg['content']})

        response = groq_client.chat.completions.create(
            model=VISION_MODEL if image_context else TEXT_MODEL,
            messages=groq_messages,
            temperature=0.5,
            max_tokens=800
        )
        
        reply = response.choices[0].message.content
        
        # Save chat messages to DB
        new_user_msg_content = messages[-1]['content']
        db.session.add(ChatMessage(session_id=session.id, role='user', content=new_user_msg_content))
        db.session.add(ChatMessage(session_id=session.id, role='assistant', content=reply))
        db.session.commit()

        return jsonify({"success": True, "reply": reply})

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

@app.route('/api/sessions', methods=['GET'])
@token_required
def get_sessions(current_user):
    sessions = StudySession.query.filter_by(user_id=current_user.id).order_by(StudySession.created_at.desc()).all()
    # Return minimal data for listing
    session_list = []
    for s in sessions:
        # Avoid sending entire base64 image if it's too large, but for now we'll include it or just a preview
        try:
            data = json.loads(s.analysis_data)
            object_name = data.get("object", "Unknown Object")
        except:
            object_name = "Session"
        
        session_list.append({
            "id": s.id,
            "object": object_name,
            "created_at": s.created_at.isoformat()
        })
    return jsonify({"success": True, "sessions": session_list})

@app.route('/api/sessions/<int:session_id>', methods=['GET'])
@token_required
def get_session_detail(current_user, session_id):
    session = StudySession.query.filter_by(id=session_id, user_id=current_user.id).first()
    if not session:
        return jsonify({"error": "Session not found"}), 404
        
    chats = ChatMessage.query.filter_by(session_id=session.id).order_by(ChatMessage.created_at.asc()).all()
    chat_list = [{"role": c.role, "content": c.content} for c in chats]
    
    return jsonify({
        "success": True,
        "session": {
            "id": session.id,
            "imageMime": session.image_mime,
            "imageContext": session.image_base64,
            "analysisData": json.loads(session.analysis_data),
            "created_at": session.created_at.isoformat()
        },
        "chats": chat_list
    })

@app.route('/api/notes/<int:session_id>', methods=['GET'])
@token_required
def get_note(current_user, session_id):
    session = StudySession.query.filter_by(id=session_id, user_id=current_user.id).first()
    if not session:
        return jsonify({"error": "Session not found"}), 404

    note = Note.query.filter_by(user_id=current_user.id, session_id=session_id).first()
    if not note:
        try:
            analysis_data = json.loads(session.analysis_data)
            title = analysis_data.get("object", "Study Notes")
        except Exception:
            title = "Study Notes"

        return jsonify({
            "success": True,
            "note": {
                "id": None,
                "session_id": session_id,
                "title": title,
                "topic": "",
                "manual_content": "",
                "ai_content": "",
                "created_at": None,
                "updated_at": None
            }
        })

    return jsonify({
        "success": True,
        "note": {
            "id": note.id,
            "session_id": note.session_id,
            "title": note.title,
            "topic": note.topic or "",
            "manual_content": note.manual_content,
            "ai_content": note.ai_content,
            "created_at": note.created_at.isoformat() if note.created_at else None,
            "updated_at": note.updated_at.isoformat() if note.updated_at else None
        }
    })

@app.route('/api/notes/<int:session_id>', methods=['PUT'])
@token_required
def save_note(current_user, session_id):
    session = StudySession.query.filter_by(id=session_id, user_id=current_user.id).first()
    if not session:
        return jsonify({"error": "Session not found"}), 404

    data = request.get_json() or {}
    manual_content = data.get('manual_content', '')
    ai_content = data.get('ai_content', '')
    topic = data.get('topic', '')

    try:
        analysis_data = json.loads(session.analysis_data)
        default_title = analysis_data.get("object", "Study Notes")
    except Exception:
        default_title = "Study Notes"

    note = Note.query.filter_by(user_id=current_user.id, session_id=session_id).first()
    if not note:
        note = Note(
            user_id=current_user.id,
            session_id=session_id,
            title=default_title
        )
        db.session.add(note)

    note.title = data.get('title') or default_title
    note.topic = topic
    note.manual_content = manual_content
    note.ai_content = ai_content
    note.updated_at = datetime.utcnow()
    db.session.commit()

    return jsonify({
        "success": True,
        "note": {
            "id": note.id,
            "session_id": note.session_id,
            "title": note.title,
            "topic": note.topic or "",
            "manual_content": note.manual_content,
            "ai_content": note.ai_content,
            "created_at": note.created_at.isoformat() if note.created_at else None,
            "updated_at": note.updated_at.isoformat() if note.updated_at else None
        }
    })

@app.route('/api/notes/generate', methods=['POST'])
@token_required
def generate_note(current_user):
    data = request.get_json() or {}
    session_id = data.get('sessionId')
    topic = (data.get('topic') or '').strip()

    session = StudySession.query.filter_by(id=session_id, user_id=current_user.id).first()
    if not session:
        return jsonify({"error": "Session not found"}), 404

    try:
        ai_settings = get_or_create_ai_settings(current_user.id)
        analysis_data = json.loads(session.analysis_data)
        object_name = analysis_data.get("object", "Study Topic")

        prompt = f"""
        Create student-friendly study notes in markdown.
        Topic focus: {topic or object_name}

        Use the following analysis details as source material:
        {json.dumps(analysis_data)}

        Requirements:
        - Use clear headings
        - Include bullet points
        - Include short examples when helpful
        - Keep it easy to understand
        - Make it useful for revision
        """
        prompt += "\n\n" + build_ai_preferences_block(ai_settings)

        response = groq_client.chat.completions.create(
            model=TEXT_MODEL,
            messages=[
                {"role": "system", "content": "You create concise, well-structured study notes in markdown.\n\n" + build_ai_preferences_block(ai_settings)},
                {"role": "user", "content": prompt}
            ],
            temperature=0.4,
            max_tokens=900
        )

        generated = response.choices[0].message.content
        return jsonify({"success": True, "content": generated})
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

@app.route('/api/workspace-notes', methods=['GET'])
@token_required
def list_workspace_notes(current_user):
    query = WorkspaceNote.query.filter_by(user_id=current_user.id)
    search = (request.args.get('search') or '').strip()
    note_type = (request.args.get('type') or '').strip()

    if note_type:
        query = query.filter_by(note_type=note_type)

    if search:
        like_term = f"%{search}%"
        query = query.filter(
            or_(
                WorkspaceNote.title.ilike(like_term),
                WorkspaceNote.topic.ilike(like_term),
                WorkspaceNote.content.ilike(like_term),
                WorkspaceNote.source_name.ilike(like_term),
            )
        )

    notes = query.order_by(WorkspaceNote.updated_at.desc()).all()
    return jsonify({"success": True, "notes": [serialize_workspace_note(note) for note in notes]})

@app.route('/api/workspace-notes', methods=['POST'])
@token_required
def create_workspace_note(current_user):
    data = request.get_json() or {}
    note_type = (data.get('type') or 'manual').strip().lower()
    if note_type not in ['manual', 'ai', 'upload']:
        return jsonify({"error": "Invalid note type"}), 400

    note = WorkspaceNote(
        user_id=current_user.id,
        session_id=data.get('session_id'),
        note_type=note_type,
        title=(data.get('title') or 'Untitled Note').strip() or 'Untitled Note',
        topic=(data.get('topic') or '').strip(),
        content=data.get('content') or ''
    )
    db.session.add(note)
    db.session.commit()

    return jsonify({"success": True, "note": serialize_workspace_note(note)}), 201

@app.route('/api/workspace-notes/<int:note_id>', methods=['GET'])
@token_required
def get_workspace_note(current_user, note_id):
    note = get_workspace_note_or_404(current_user, note_id)
    if not note:
        return jsonify({"error": "Note not found"}), 404

    chats = NoteChatMessage.query.filter_by(note_id=note.id).order_by(NoteChatMessage.created_at.asc()).all()
    return jsonify({
        "success": True,
        "note": serialize_workspace_note(note),
        "chats": [serialize_note_chat(chat) for chat in chats]
    })

@app.route('/api/workspace-notes/<int:note_id>', methods=['PUT'])
@token_required
def update_workspace_note(current_user, note_id):
    note = get_workspace_note_or_404(current_user, note_id)
    if not note:
        return jsonify({"error": "Note not found"}), 404

    data = request.get_json() or {}
    next_title = data.get('title')
    if next_title is not None:
        note.title = next_title.strip() or note.title
    if data.get('topic') is not None:
        note.topic = data.get('topic') or ''
    if data.get('content') is not None:
        note.content = data.get('content') or ''
    if data.get('session_id') is not None:
        note.session_id = data.get('session_id')

    note.updated_at = datetime.utcnow()
    db.session.commit()
    return jsonify({"success": True, "note": serialize_workspace_note(note)})

@app.route('/api/workspace-notes/<int:note_id>', methods=['DELETE'])
@token_required
def delete_workspace_note(current_user, note_id):
    note = get_workspace_note_or_404(current_user, note_id)
    if not note:
        return jsonify({"error": "Note not found"}), 404

    NoteChatMessage.query.filter_by(note_id=note.id).delete()
    db.session.delete(note)
    db.session.commit()
    return jsonify({"success": True})

@app.route('/api/workspace-notes/generate', methods=['POST'])
@token_required
def generate_workspace_note(current_user):
    data = request.get_json() or {}
    session_id = data.get('sessionId')
    topic = (data.get('topic') or '').strip()

    if not session_id and not topic:
        return jsonify({"error": "A topic or linked session is required"}), 400

    session = None
    analysis_data = {}
    object_name = topic or "Study Topic"

    if session_id:
        session = StudySession.query.filter_by(id=session_id, user_id=current_user.id).first()
        if not session:
            return jsonify({"error": "Session not found"}), 404
        analysis_data = json.loads(session.analysis_data)
        object_name = topic or analysis_data.get("object", "Study Topic")

    source_material = json.dumps(analysis_data) if analysis_data else "No linked image analysis. Use the requested topic only."
    prompt = f"""
    Create student-friendly study notes in markdown.
    Topic focus: {object_name}

    Use the following source material when available:
    {source_material}

    Requirements:
    - Use clear headings
    - Include bullet points
    - Include short examples when helpful
    - Keep it easy to understand
    - Make it useful for revision
    """

    try:
        ai_settings = get_or_create_ai_settings(current_user.id)
        response = groq_client.chat.completions.create(
            model=TEXT_MODEL,
            messages=[
                {"role": "system", "content": "You create concise, well-structured study notes in markdown.\n\n" + build_ai_preferences_block(ai_settings)},
                {"role": "user", "content": prompt + "\n\n" + build_ai_preferences_block(ai_settings)}
            ],
            temperature=0.4,
            max_tokens=900
        )

        generated = response.choices[0].message.content
        note = WorkspaceNote(
            user_id=current_user.id,
            session_id=session.id if session else None,
            note_type='ai',
            title=object_name,
            topic=topic,
            content=generated
        )
        db.session.add(note)
        db.session.commit()

        return jsonify({"success": True, "note": serialize_workspace_note(note)})
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

@app.route('/api/workspace-notes/upload', methods=['POST'])
@token_required
def upload_workspace_note(current_user):
    if 'file' not in request.files:
        return jsonify({"error": "No file provided"}), 400

    file = request.files['file']
    if not file or file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    try:
        extracted = extract_uploaded_text(file)
        note = WorkspaceNote(
            user_id=current_user.id,
            note_type='upload',
            title=(request.form.get('title') or extracted["filename"]).strip() or extracted["filename"],
            topic=(request.form.get('topic') or '').strip(),
            content=extracted["text"],
            source_name=extracted["filename"],
            source_mime=extracted["mime_type"],
            source_base64=extracted["base64_file"],
            source_text=extracted["text"]
        )
        db.session.add(note)
        db.session.commit()
        return jsonify({"success": True, "note": serialize_workspace_note(note)}), 201
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 400

@app.route('/api/workspace-notes/<int:note_id>/chat', methods=['POST'])
@token_required
def chat_on_workspace_note(current_user, note_id):
    note = get_workspace_note_or_404(current_user, note_id)
    if not note:
        return jsonify({"error": "Note not found"}), 404

    data = request.get_json() or {}
    messages = data.get('messages', [])
    if not messages:
        return jsonify({"error": "No messages provided"}), 400

    try:
        ai_settings = get_or_create_ai_settings(current_user.id)
        system_prompt = """
        You are SnapStudy, an expert study tutor and note-editing assistant.
        You can do two things:
        1. Answer questions about the note.
        2. Edit and improve the note when the user asks for rewriting, expanding, shortening, restructuring, formatting, correcting, or updating.

        Return VALID JSON only with this shape:
        {
          "reply": "your chat reply in markdown",
          "should_update_note": true or false,
          "updated_title": "string or null",
          "updated_topic": "string or null",
          "updated_content": "full updated note content or null",
          "change_summary": "short explanation of what changed or null"
        }

        Rules:
        - If the user is asking for an edit, set should_update_note to true and return the full updated note.
        - If the user is only asking a question, set should_update_note to false.
        - Keep the note student-friendly, clear, and well-structured.
        - Preserve important existing information unless the user asks you to remove or replace it.
        - Use markdown formatting inside reply and updated_content when helpful.
        """
        system_prompt += "\n\n" + build_ai_preferences_block(ai_settings)
        note_context = build_workspace_note_context(note)
        groq_messages = [
            {"role": "system", "content": f"{system_prompt}\n\nContext:\n{note_context}"}
        ]

        for msg in messages:
            role = "assistant" if msg['role'] == "assistant" else "user"
            groq_messages.append({"role": role, "content": msg['content']})

        response = groq_client.chat.completions.create(
            model=TEXT_MODEL,
            messages=groq_messages,
            temperature=0.5,
            max_tokens=1400
        )

        payload = parse_agentic_note_response(response.choices[0].message.content, note)
        reply = payload.get("reply") or "I updated my response."
        should_update_note = bool(payload.get("should_update_note"))
        change_summary = payload.get("change_summary")

        updated_note_payload = None
        if should_update_note:
            next_title = payload.get("updated_title") or note.title
            next_topic = payload.get("updated_topic")
            next_content = payload.get("updated_content") or note.content

            note.title = next_title
            if next_topic is not None:
                note.topic = next_topic
            note.content = next_content
            note.updated_at = datetime.utcnow()

            updated_note_payload = {
                "id": note.id,
                "title": note.title,
                "topic": note.topic or "",
                "content": note.content,
                "change_summary": change_summary or "The note was updated by the AI assistant."
            }

        db.session.add(NoteChatMessage(note_id=note.id, role='user', content=messages[-1]['content']))
        db.session.add(NoteChatMessage(note_id=note.id, role='assistant', content=reply))
        db.session.commit()

        return jsonify({
            "success": True,
            "reply": reply,
            "noteUpdated": should_update_note,
            "updatedNote": updated_note_payload
        })
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
