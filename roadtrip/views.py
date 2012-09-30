from pyramid.view import view_config

@view_config(route_name='home', renderer='templates/mytemplate.pt')
def my_view(request):
    return {'project':'roadtrip'}

@view_config(route_name='get_map_path', renderer='json')
def map_path_view(request):
    stage = 'stage%d' % int(request.params['stage'])
    trip_id = request.params['id']
    return request.db.trips.find_one({'trip_id': trip_id}, { stage: 1})[stage]
