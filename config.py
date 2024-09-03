import os

class Config:

    BOT_TOKEN = os.environ.get('6286871173:AAEqnQrgYyewZS0IO5VVZdP5LXqKF-sEW7w', None)
    APP_ID = os.environ.get('7391573', None)
    API_HASH = os.environ.get('1f20df54dfd91bcee05278d3b01da2c7', None)

    #comma seperated user id of users who are allowed to use
    ALLOWED_USERS = [x.strip(' ') for x in os.environ.get('ALLOWED_USERS','1967154353').split(',')]

    DOWNLOAD_DIR = 'downloads'
