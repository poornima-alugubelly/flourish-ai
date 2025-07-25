from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime, Table, ForeignKey, JSON, Boolean, Float
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime, timezone
import os

DATABASE_URL = "sqlite:///./mental_health_journal.db"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Association table for many-to-many relationship between Notes and Tags
note_tags = Table(
    'note_tags',
    Base.metadata,
    Column('note_id', Integer, ForeignKey('notes.id'), primary_key=True),
    Column('tag_id', Integer, ForeignKey('tags.id'), primary_key=True)
)

class Note(Base):
    __tablename__ = "notes"
    
    id = Column(Integer, primary_key=True, index=True)
    date = Column(String, nullable=False)  # Format: YYYY-MM-DD
    hour = Column(Integer, nullable=False)  # 0-23
    content = Column(Text)
    rich_content = Column(JSON)  # Store rich text as JSON
    template_id = Column(String, nullable=True)  # Template used if any
    is_sleep = Column(Boolean, default=False)
    sleep_quality = Column(Integer, nullable=True)  # 1-5 rating
    sleep_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    
    # Many-to-many relationship with tags
    tags = relationship("Tag", secondary=note_tags, back_populates="notes")

class Goal(Base):
    __tablename__ = "goals"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text)
    category = Column(String, default="Personal")
    target_date = Column(DateTime, nullable=True)
    progress = Column(Float, default=0.0)  # 0.0 to 100.0
    status = Column(String, default="active")  # active, completed, paused, cancelled
    is_smart = Column(Boolean, default=True)
    specific = Column(Text, nullable=True)
    measurable = Column(Text, nullable=True)
    achievable = Column(Text, nullable=True)
    relevant = Column(Text, nullable=True)
    time_bound = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    
    # One-to-many relationship with milestones
    milestones = relationship("Milestone", back_populates="goal", cascade="all, delete-orphan")

class Milestone(Base):
    __tablename__ = "milestones"
    
    id = Column(Integer, primary_key=True, index=True)
    goal_id = Column(Integer, ForeignKey("goals.id"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, default="")
    target_date = Column(DateTime, nullable=True)
    completed = Column(Boolean, default=False)
    completed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    
    # Many-to-one relationship with goal
    goal = relationship("Goal", back_populates="milestones")

class GoalCategory(Base):
    __tablename__ = "goal_categories"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    description = Column(Text, default="")
    icon = Column(String, default="Target")  # Lucide icon name
    color = Column(String, default="#3B82F6")  # Hex color
    is_default = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

class Tag(Base):
    __tablename__ = "tags"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    color = Column(String, default="#3B82F6")  # Hex color for the tag
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    
    # Many-to-many relationship with notes
    notes = relationship("Note", secondary=note_tags, back_populates="tags")

class SleepSchedule(Base):
    __tablename__ = "sleep_schedules"
    
    id = Column(Integer, primary_key=True, index=True)
    start_hour = Column(Integer, nullable=False)  # Sleep start hour (0-23)
    end_hour = Column(Integer, nullable=False)    # Wake up hour (0-23)
    default_quality = Column(Integer, nullable=True)  # Default sleep quality (1-5)
    is_active = Column(Boolean, default=True)     # Whether this schedule is currently active
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

class Analysis(Base):
    __tablename__ = "analyses"
    
    id = Column(Integer, primary_key=True, index=True)
    date = Column(String, nullable=False)  # Format: YYYY-MM-DD
    notes_content = Column(JSON)  # Store the notes that were analyzed
    goals_content = Column(Text)  # Store the goals/reflection content
    ai_response = Column(Text)  # The AI analysis response
    model_used = Column(String, default="phi3:mini")
    processing_time = Column(Float)  # Time taken for analysis in seconds
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class NoteTemplate(Base):
    __tablename__ = "note_templates"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    description = Column(Text)
    category = Column(String, default="General")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def create_tables():
    Base.metadata.create_all(bind=engine)

def init_default_data():
    """Initialize the database with default templates and tags"""
    db = SessionLocal()
    try:
        # Check if we already have templates
        if db.query(NoteTemplate).count() > 0:
            return
            
        # Default templates
        templates = [
            {
                "name": "Morning Reflection",
                "content": "How am I feeling this morning? What are my intentions for the day?",
                "description": "Start your day with mindful reflection",
                "category": "Daily"
            },
            {
                "name": "Work Session",
                "content": "What am I working on? How focused do I feel? Any challenges or breakthroughs?",
                "description": "Track work-related thoughts and productivity",
                "category": "Work"
            },
            {
                "name": "Mood Check",
                "content": "How am I feeling right now? What might be influencing my mood?",
                "description": "Quick emotional state assessment",
                "category": "Emotional"
            },
            {
                "name": "Gratitude",
                "content": "What am I grateful for right now? What went well?",
                "description": "Focus on positive aspects and appreciation",
                "category": "Personal Development"
            },
            {
                "name": "Evening Wind-down",
                "content": "How was my day? What did I learn? What am I looking forward to tomorrow?",
                "description": "End-of-day reflection and planning",
                "category": "Daily"
            }
        ]
        
        for template_data in templates:
            template = NoteTemplate(**template_data)
            db.add(template)
        
        # Default tags
        tags = [
            {"name": "Happy", "color": "#10B981"},
            {"name": "Stressed", "color": "#EF4444"},
            {"name": "Productive", "color": "#3B82F6"},
            {"name": "Tired", "color": "#6B7280"},
            {"name": "Excited", "color": "#F59E0B"},
            {"name": "Anxious", "color": "#8B5CF6"},
            {"name": "Peaceful", "color": "#06B6D4"},
            {"name": "Focused", "color": "#84CC16"},
        ]
        
        for tag_data in tags:
            tag = Tag(**tag_data)
            db.add(tag)

        # Default goal categories
        goal_categories = [
            {
                "name": "Health & Fitness",
                "description": "Physical health, exercise, nutrition, and wellness goals",
                "icon": "Heart",
                "color": "#EF4444",
                "is_default": True
            },
            {
                "name": "Career & Professional",
                "description": "Work-related goals, skill development, and career advancement",
                "icon": "Briefcase",
                "color": "#3B82F6",
                "is_default": True
            },
            {
                "name": "Education & Learning",
                "description": "Learning new skills, courses, certifications, and knowledge acquisition",
                "icon": "BookOpen",
                "color": "#8B5CF6",
                "is_default": True
            },
            {
                "name": "Personal Development",
                "description": "Self-improvement, habits, mindfulness, and personal growth",
                "icon": "User",
                "color": "#10B981",
                "is_default": True
            },
            {
                "name": "Relationships & Social",
                "description": "Family, friends, networking, and social connections",
                "icon": "Users",
                "color": "#F59E0B",
                "is_default": True
            },
            {
                "name": "Finance & Money",
                "description": "Savings, investments, budgeting, and financial planning",
                "icon": "DollarSign",
                "color": "#059669",
                "is_default": True
            },
            {
                "name": "Creative & Hobbies",
                "description": "Artistic pursuits, hobbies, creative projects, and self-expression",
                "icon": "Palette",
                "color": "#EC4899",
                "is_default": True
            },
            {
                "name": "Travel & Adventure",
                "description": "Travel plans, experiences, and adventure goals",
                "icon": "MapPin",
                "color": "#06B6D4",
                "is_default": True
            }
        ]
        
        for category_data in goal_categories:
            category = GoalCategory(**category_data)
            db.add(category)
        
        db.commit()
    except Exception as e:
        print(f"Error initializing default data: {e}")
        db.rollback()
    finally:
        db.close() 