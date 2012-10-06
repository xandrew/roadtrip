import itertools
import json
import os

from pyramid.view import view_config

@view_config(route_name='home', renderer='templates/mytemplate.pt')
def my_view(request):
    return {'project':'roadtrip'}

@view_config(route_name='get_stage_data', renderer='json')
def stage_data_view(request):
    stage = int(request.params['stage'])
    trip_id = request.params['id']
    return request.db.trips.find_one(
        {'trip_id': trip_id}, {'stages': 1})['stages'][stage]

def get_all_images(trip_id):
    return [fn for fn in sorted(os.listdir('roadtrip/static/' + trip_id))
            if fn.endswith('JPG')]

@view_config(route_name='get_trip_data', renderer='json')
def trip_data_view(request):
    trip_id = request.params['id']
    trip = request.db.trips.find_one({'trip_id': trip_id})
    if trip:
        del trip['_id']
    else:
        trip = {
            'trip_id': trip_id,
            'stages': [{'images': []}],
            'trashed_images': []
            }
        
    used_images = set(itertools.chain(*(
                [stage['images'] for stage in trip['stages']] +
                [trip['trashed_images']])))
    trip['remaining_images'] = [image for image in get_all_images(trip_id)
                                if image not in used_images]
    return trip

@view_config(route_name='save', renderer='json')
def save_view(request):
    trip_id = request.params['id']
    data = json.loads(request.params['data'])
    request.db.trips.remove({'trip_id': trip_id})
    request.db.trips.insert(data)
    return {}

