#!/usr/bin/python
import os
from subprocess import call

base = '/home/tim/tmp/'
app_name = 'electron-atm'
git_path = 'https://github.com/timgabets/' + app_name

os.chdir(base)
call(["git", "clone", git_path])

os.chdir(app_name)
call(["npm install"])
