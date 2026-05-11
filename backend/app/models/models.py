from sqlalchemy import Column, Integer, String, Text, DateTime, Float, Boolean, JSON, Enum as SAEnum
from sqlalchemy.sql import func
import enum
from app.db.database import Base


class AgentStatus(str, enum.Enum):
    ONLINE = "online"
    OFFLINE = "offline"
    BUSY = "busy"
    ERROR = "error"


class AlertLevel(str, enum.Enum):
    INFO = "info"
    WARNING = "warning"
    CRITICAL = "critical"


class TaskStatus(str, enum.Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"


class ReviewStatus(str, enum.Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    NEED_REVIEW = "need_review"


class AgentModel(Base):
    __tablename__ = "agents"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), nullable=False, unique=True)
    display_name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String(20), default=AgentStatus.ONLINE.value)
    avatar = Column(String(200), nullable=True)
    config = Column(JSON, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())


class ConversationModel(Base):
    __tablename__ = "conversations"

    id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(String(200), nullable=True)
    agent_id = Column(Integer, nullable=False)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())


class MessageModel(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, autoincrement=True)
    conversation_id = Column(Integer, nullable=False)
    role = Column(String(20), nullable=False)  # user, assistant, system
    content = Column(Text, nullable=False)
    agent_name = Column(String(100), nullable=True)  # 哪个agent发送的
    metadata_ = Column("metadata", JSON, nullable=True)
    created_at = Column(DateTime, server_default=func.now())


class RiskAlertModel(Base):
    __tablename__ = "risk_alerts"

    id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    level = Column(String(20), default=AlertLevel.INFO.value)
    source = Column(String(100), nullable=True)
    status = Column(String(20), default="open")
    related_entity = Column(String(200), nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    resolved_at = Column(DateTime, nullable=True)


class InspectionTaskModel(Base):
    __tablename__ = "inspection_tasks"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    type = Column(String(50), nullable=True)  # 巡检类型
    status = Column(String(20), default=TaskStatus.PENDING.value)
    result = Column(Text, nullable=True)
    score = Column(Float, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    completed_at = Column(DateTime, nullable=True)


class ReviewItemModel(Base):
    __tablename__ = "review_items"

    id = Column(Integer, primary_key=True, autoincrement=True)
    item_id = Column(String(100), nullable=False)  # 商品/内容ID
    item_type = Column(String(50), nullable=False)  # product, content, etc.
    title = Column(String(200), nullable=True)
    status = Column(String(20), default=ReviewStatus.PENDING.value)
    risk_score = Column(Float, nullable=True)
    review_comment = Column(Text, nullable=True)
    reviewer = Column(String(100), nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    reviewed_at = Column(DateTime, nullable=True)


class ConsultationRecordModel(Base):
    __tablename__ = "consultation_records"

    id = Column(Integer, primary_key=True, autoincrement=True)
    question = Column(Text, nullable=False)
    answer = Column(Text, nullable=False)
    category = Column(String(100), nullable=True)
    related_policy = Column(String(200), nullable=True)
    created_at = Column(DateTime, server_default=func.now())
