

cd   openstack_dashboard/

django-admin  makemessages -l zh_CN
python ../manage.py  compilemessages

python manage.py  runserver  0:44444
