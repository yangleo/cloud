from openstack_dashboard import api
import logging
from horizon import exceptions
from django.http.response import HttpResponse
import json

LOG = logging.getLogger(__name__)

def getImages(request):
    try:
        images,more,prev= api.glance.image_list_detailed(request)
        result={}
        for image in images:
            if image.status=='active':
                image_dict={'id':str(image.id),'name':str(image.name),'size':int(image.size/(1024*1024))}
            os_type=image.properties['os_distro'] if image.properties and image.properties.has_key('os_distro') else 'other'
            if image.properties and image.properties.has_key('image_type') and image.properties['image_type']=='snapshot':
                os_type='snapshot'
            if result.has_key(os_type):
                result[os_type].append(image_dict)
            else:
                result[os_type]=[image_dict]
#        aa = {u'status': u'active', u'virtual_size': None, u'name': u'snapshot_centos', u'deleted': False, u'container_format': u'bare', u'created_at': u'2016-09-02T03:35:43.000000', u'disk_format': u'qcow2', u'updated_at': u'2016-09-02T03:36:23.000000', u'properties': {u'instance_uuid': u'5c09388e-b384-45d1-9fb6-5232840e21a6', u'image_location': u'snapshot', u'image_state': u'available', u'user_id': u'6944c1de6f96421b8d182d05702a37e7', u'os_distro': u'CentOS', u'image_type': u'snapshot', u'ramdisk_id': None, u'os_version': u'CentOS6.5_x64', u'kernel_id': None, u'architecture': u'x86_64', u'base_image_ref': u'3c26f6ba-d224-4c0f-b6ca-d69ce0b9ee01', u'owner_id': u'b8de93e20148470dbc45e802240c3d10'}, u'owner': u'b8de93e20148470dbc45e802240c3d10', u'protected': False, u'min_ram': 0, u'checksum': u'fbc2f3cab6e896b7ffa43efd7d438223', u'min_disk': 40, u'is_public': False, u'deleted_at': None, u'id': u'd46619e2-ed8f-4d94-864b-3ad893c728fa', u'size': 963575808}
    except Exception:
        LOG.exception("getImages error ");
        exceptions.handle(request, ignore=True)
        return HttpResponse('error')
    return HttpResponse(json.dumps(result))


def getNetworks(request):
    try:
        result=[]
        nets = api.neutron.network_list(request)
        if nets:
            for net in nets:
                if net.status=='ACTIVE' and net.router__external==False:   
                    result.append({'name':net.name,'id':net.id})
    except Exception:
        exceptions.handle(request, ignore=True)
        return HttpResponse('error')
    return HttpResponse(json.dumps(result))


def instance_flavor_create(request):
    try:
        post_data = request.GET
        mem = int(post_data.get('memory'))*1024
        vcpus = int(post_data.get('vcpus'))
        disk = int(post_data.get('disk'))
        ephemeral = int(post_data.get('ephemeral'))
        swap = int(post_data.get('swap'))*1024
        flavor_id = _get_flavor_id(request, vcpus, mem, disk, ephemeral, swap)
        if not flavor_id:
            return HttpResponse('create flavor failure')
        else:
            return HttpResponse(flavor_id)
    except Exception:
        exceptions.handle(request, ignore=True)
        return HttpResponse('error')
    
    
def _get_flavor_id(request, vcpus=1, ram=1024, disk=1, ephemeral=0, swap=0):
    flavor_id = None
    flavor_list = api.nova.flavor_list(request)
    LOG.info(flavor_list)
    for flavor in flavor_list:
        if flavor.vcpus == vcpus \
            and flavor.ram == ram \
            and flavor.disk == disk \
            and flavor.ephemeral == ephemeral \
            and flavor.swap == swap \
            and flavor.rxtx_factor == 1.0:
            flavor_id = flavor.id
            break
    
    if not flavor_id:
        flavor_name = "m1." + str(vcpus) + "." + str(ram) + "." + str(disk) + "." + str(ephemeral) + "." + str(swap)
        flavor_new = api.nova.flavor_create(request, flavor_name, ram, vcpus, disk, 'auto', ephemeral, swap)
        if flavor_new:
            LOG.info(flavor_new.id)
            flavor_id = flavor_new.id
    return flavor_id


def instance_create(request):
    try:
        post_data = request.GET
        name = post_data.get('name')
        image_id = post_data.get('image_id')
        nics = [{'net-id':post_data.get('netid')}]
        admin_pass = post_data.get('root_pass')
        meta={'admin_pass':admin_pass,'hostname':name}
        instance_count=post_data.get('instance_count')
        flavorid = post_data.get('flavor_id');
        #get flavors
        if not flavorid:
            return HttpResponse('create flavor failure')
        server = api.nova.server_create(request,
                                       name,
                                       image_id,
                                       flavorid,
                                       nics=nics,
                                       instance_count=instance_count,
                                       admin_pass=admin_pass,
                                       meta=meta)  
        if server:
            return HttpResponse('success')
        else:
            return HttpResponse('create error')
    except Exception:
        exceptions.handle(request, ignore=True)
        return HttpResponse('error')