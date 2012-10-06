import pymongo

from pyramid.config import Configurator
from pyramid.events import subscriber
from pyramid.events import NewRequest
try:
    from urllib.parse import urlparse
except:
    from urlparse import urlparse

def main(global_config, **settings):
    """ This function returns a Pyramid WSGI application.
    """
    config = Configurator(settings=settings)
    config.add_static_view('static', 'static', cache_max_age=3600)

    db_url = urlparse(settings['mongo_uri'])
    conn = pymongo.Connection(host=db_url.hostname,
                              port=db_url.port)
    config.registry.settings['db_conn'] = conn

    def add_mongo_db(event):
        settings = event.request.registry.settings
        db = settings['db_conn'][db_url.path[1:]]
        if db_url.username and db_url.password:
            db.authenticate(db_url.username, db_url.password)
        event.request.db = db
        # event.request.fs = GridFS(db)

    config.add_subscriber(add_mongo_db, NewRequest)

    config.add_route('home', '/')
    config.add_route('get_trip_data', '/get_trip_data')
    config.add_route('get_stage_data', '/get_stage_data')
    config.add_route('save', '/save')

    config.scan()
    return config.make_wsgi_app()
