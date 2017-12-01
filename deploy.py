#!/usr/bin/python

import os
import json
import glob
from subprocess import call
from pprint import pprint

base = '/home/tim/tmp/'
app_name = 'electron-atm'
git_path = 'https://github.com/timgabets/' + app_name
dest_path = '/var/www/atmtools.org/html/dist/' + app_name + '/'

def checkout():
  if os.path.isdir(base + app_name) and os.path.exists(base + app_name + '/' + 'package.json'):
    print('Updating')
    os.chdir(app_name)
    call(['git', 'pull'])
  else:
    print('Checkout')
    call(['git', 'clone', git_path])


def install_dependencies():
  print('Installing dependencies')
  os.chdir(base + app_name)
  call(['npm', 'install'])


def get_app_version(package_json):
  data = json.load(open(package_json))
  return data['version']


def build():
  os.chdir(base + app_name)
  print('Cleaning dist/')
  call(['rm', '-f', 'dist/*.exe'])
  call(['rm', '-f', '*dist/.AppImage'])
  print('Building')
  call(['npm', 'run', 'dist'])
  call(['npm', 'run', 'win32'])


def deploy(app_version):
  call(['mkdir', '-p', dest_path])
  os.chdir(dest_path)
  call(['mkdir', '-p', app_version ])

  print('Copying to ' + dest_path + app_version)
  os.chdir(base + app_name + '/dist')
  try:
    call(['mv', glob.glob('*.AppImage')[0], dest_path + app_version + '/'])
  except IndexError:
    pass

  try:
    call(['mv', glob.glob('*.exe')[0], dest_path + app_version + '/'])
  except IndexError:
    pass


def make_symlink(app_version):
  os.chdir(dest_path)
  call(['rm', '-f', 'latest'])
  call(['ln', '-s', app_version, 'latest'])

"""
"""
os.chdir(base)

checkout()
install_dependencies()
app_version = get_app_version(base + app_name + '/' + 'package.json')
build()
deploy(app_version)
make_symlink(app_version)

