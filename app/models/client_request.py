import json, datetime
from app import db
from app.models.correspondence import Correspondence
from sqlalchemy.ext.declarative import DeclarativeMeta
from uuid import UUID

class ClientRequest(db.Model):
    __tablename__ = 'client_requests'
    __table_args__ = {'mysql_engine': 'InnoDB'}
    id = db.Column(db.Integer, primary_key=True)
    public_id = db.Column(db.String(50), unique=True)
    subject = db.Column(db.String(200))
    status = db.Column(db.String(40), default='Pending')
    created_date = db.Column(db.DateTime, default=datetime.datetime.now)
    description = db.Column(db.String(2000))
    client_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    correspondence = db.relationship('Correspondence', backref='client_request', uselist=False)

    RELATIONSHIPS_TO_DICT = True

    def __iter__(self):
        return self.to_dict().iteritems()

    def to_dict(self, rel=None, backref=None):
        if rel is None:
            rel = self.RELATIONSHIPS_TO_DICT
        res = {column.key: getattr(self, attr)
               for attr, column in self.__mapper__.c.items()}
        if rel:
            for attr, relation in self.__mapper__.relationships.items():
                # Avoid recursive loop between to tables.
                if backref == relation.table:
                    continue
                value = getattr(self, attr)
                if value is None:
                    res[relation.key] = None
                elif isinstance(value.__class__, DeclarativeMeta):
                    res[relation.key] = value.to_dict(backref=self.__table__)
                else:
                    res[relation.key] = [i.to_dict(backref=self.__table__)
                                         for i in value]
        return res

    def to_json(self, rel=None):
        def extended_encoder(x):
            if isinstance(x, datetime):
                return x.isoformat()
            if isinstance(x, UUID):
                return str(x)
        if rel is None:
            rel = self.RELATIONSHIPS_TO_DICT
        return json.dumps(self.to_dict(rel), default=extended_encoder)
