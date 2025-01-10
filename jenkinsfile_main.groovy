// Definición de la función fuera del bloque `script`
def checkContainerExists(containerName) {
    return sh(script: "docker ps -a --filter 'name=${containerName}' --format '{{.Names}}'", returnStdout: true).trim() == containerName
}

def runSite() {
    // Llama a la función que verifica la existencia del contenedor
    def containerNameSite = "siteunsushi-prod"

    // Comprobar si el contenedor ya existe
    if (checkContainerExists(containerNameSite)) {
        echo "El contenedor ${containerNameSite} ya existe. Deteniéndolo y eliminándolo..."
        sh "docker stop ${containerNameSite} || true" // Detener el contenedor si está en ejecución
        sh "docker rm ${containerNameSite} || true"   // Eliminar el contenedor
    }

    // Copiar configuración del backend
    sh '''
        #!/bin/bash
        sudo cp site.conf /etc/nginx/sites-available/unsushi.com
        if [ -f /etc/nginx/sites-enabled/unsushi.com ]; then
            echo "ya esta el enlace"
        else
            ln -s /etc/nginx/sites-available/unsushi.com /etc/nginx/sites-enabled/unsushi.com
        fi
        cd site
        npm install
        npm install -g @angular/cli --no-cache
        ng build 
        docker build -f Dockerfile.prod -t siteunsushi:prod .
        docker run -it -p 4302:4302 -e PORT=4302 --name siteunsushi-prod -d siteunsushi:prod
    '''
}

def runAdmin() {
    sh '''
        #!/bin/bash
        sudo cp admin.conf /etc/nginx/sites-available/admin.unsushi.com
        if [ -f /etc/nginx/sites-enabled/admin.unsushi.com ]; then
            echo "ya esta el enlace"
        else
            ln -s /etc/nginx/sites-available/admin.unsushi.com /etc/nginx/sites-enabled/admin.unsushi.com
        fi
        cd admin
        npm install
        npm install -g @angular/cli --no-cache
        ng build
    '''
}

def runBack() {
    // Acceso a credenciales de producción
    withCredentials([string(credentialsId: 'mongo_uri_prod', variable: 'MONGO_URI_UN_PROD'),
                        string(credentialsId: 'jwt_secret_key', variable: 'JWT_SECRET_KEY_UN_PROD'),
                        string(credentialsId: 'allowed_origins_prod', variable: 'ALLOWED_ORIGINS_UN_PROD'),
                        string(credentialsId: 'mail_server', variable: 'MAIL_SERVER_UN_PROD'),
                        string(credentialsId: 'mail_username', variable: 'MAIL_USERNAME_UN_PROD'),
                        string(credentialsId: 'mail_password', variable: 'MAIL_PASSWORD_UN_PROD'),
                        string(credentialsId: 'dont_reply_from_email', variable: 'DONT_REPLY_FROM_EMAIL_UN_PROD'),
                        string(credentialsId: 'admins', variable: 'ADMINS_UN_PROD')]) {
    writeFile file: 'api/.env.prod', text: """
            DEBUG=False
            MONGO_URI=${MONGO_URI_UN_PROD}
            SECRET_KEY=${JWT_SECRET_KEY_UN_PROD}
            ALLOWED_ORIGINS=${ALLOWED_ORIGINS_UN_PROD}
            MAIL_SERVER=${MAIL_SERVER_UN_PROD}
            MAIL_PORT=587
            MAIL_USERNAME=${MAIL_USERNAME_UN_PROD}
            MAIL_PASSWORD=${MAIL_PASSWORD_UN_PROD}
            DONT_REPLY_FROM_EMAIL=${DONT_REPLY_FROM_EMAIL_UN_PROD}
            ADMINS=${ADMINS_UN_PROD}
            MAIL_USE_TLS=False
    """
    }

    // Nombre del contenedor a verificar
    def containerNameBack = "backunsushi-prod"

    // Comprobar si el contenedor ya existe
    if (checkContainerExists(containerNameBack)) {
        echo "El contenedor ${containerNameBack} ya existe. Deteniéndolo y eliminándolo..."
        sh "docker stop ${containerNameBack} || true" // Detener el contenedor si está en ejecución
        sh "docker rm ${containerNameBack} || true"   // Eliminar el contenedor
    }

    // Copiar configuración del backend
    sh '''
        #!/bin/bash
        sudo cp backend.conf /etc/nginx/sites-available/backend.unsushi.com
        if [ -f /etc/nginx/sites-enabled/backend.unsushi.com ]; then
            echo "ya está el enlace"
        else
            ln -s /etc/nginx/sites-available/backend.unsushi.com /etc/nginx/sites-enabled/backend.unsushi.com
        fi
        cd api
        docker build -f Dockerfile.prod -t backunsushi:prod .
        docker run -v /etc/volumes/unsushi/uploads:/app/uploads -it -e FLASK_ENV=prod -p 4301:4301 --name backunsushi-prod -d backunsushi:prod
        sudo systemctl restart nginx.service
    '''
}

return this