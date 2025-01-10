// Definición de la función fuera del bloque `script`
def checkContainerExists(containerName) {
    return sh(script: "docker ps -a --filter 'name=${containerName}' --format '{{.Names}}'", returnStdout: true).trim() == containerName
}

def runSite() {
    // Llama a la función que verifica la existencia del contenedor
    def containerNameSite = "siteunsushi-qa"

    // Comprobar si el contenedor ya existe
    if (checkContainerExists(containerNameSite)) {
        echo "El contenedor ${containerNameSite} ya existe. Deteniéndolo y eliminándolo..."
        sh "docker stop ${containerNameSite} || true" // Detener el contenedor si está en ejecución
        sh "docker rm ${containerNameSite} || true"   // Eliminar el contenedor
    }

    // Copiar configuración del backend
    sh '''
    #!/bin/bash
    sudo cp www-qa-site.conf /etc/nginx/sites-available/www-qa.unsushi.com
    if [ -f /etc/nginx/sites-enabled/www-qa.unsushi.com ]; then
        echo "ya esta el enlace"
    else
        ln -s /etc/nginx/sites-available/www-qa.unsushi.com /etc/nginx/sites-enabled/www-qa.unsushi.com
    fi
    cd site
    npm install
    npm install -g @angular/cli
    ng build --configuration=qa
    docker build -f Dockerfile.qa -t siteunsushi:qa .
    docker run -it -p 4402:4402 -e PORT=4402 --name siteunsushi-qa -d siteunsushi:qa 
    '''
}

def runAdmin() {
    sh '''
        #!/bin/bash
        sudo cp www-qa-admin.conf /etc/nginx/sites-available/www-qa-admin.unsushi.com
        if [ -f /etc/nginx/sites-enabled/www-qa-admin.unsushi.com ]; then
            echo "ya esta el enlace"
        else
            ln -s /etc/nginx/sites-available/www-qa-admin.unsushi.com /etc/nginx/sites-enabled/www-qa-admin.unsushi.com
        fi
        cd admin
        npm install
        npm install -g @angular/cli
        ng build --configuration=qa
    '''
}

def runBack() {
    withCredentials([string(credentialsId: 'mongo_uri_qa', variable: 'MONGO_URI_UN_QA'),
                string(credentialsId: 'jwt_secret_key', variable: 'JWT_SECRET_KEY_UN_QA'),
                string(credentialsId: 'allowed_origins_qa', variable: 'ALLOWED_ORIGINS_UN_QA'),
                string(credentialsId: 'mail_server', variable: 'MAIL_SERVER_UN_QA'),
                string(credentialsId: 'mail_username', variable: 'MAIL_USERNAME_UN_QA'),
                string(credentialsId: 'mail_password', variable: 'MAIL_PASSWORD_UN_QA'),
                string(credentialsId: 'dont_reply_from_email', variable: 'DONT_REPLY_FROM_EMAIL_UN_QA'),
                string(credentialsId: 'admins', variable: 'ADMINS_UN_QA')]) {
    writeFile file: 'api/.env.qa', text: """
        DEBUG=False
        MONGO_URI=${MONGO_URI_UN_QA}
        SECRET_KEY=${JWT_SECRET_KEY_UN_QA}
        ALLOWED_ORIGINS=${ALLOWED_ORIGINS_UN_QA}
        MAIL_SERVER=${MAIL_SERVER_UN_QA}
        MAIL_PORT=587
        MAIL_USERNAME=${MAIL_USERNAME_UN_QA}
        MAIL_PASSWORD=${MAIL_PASSWORD_UN_QA}
        DONT_REPLY_FROM_EMAIL=${DONT_REPLY_FROM_EMAIL_UN_QA}
        ADMINS=${ADMINS_UN_QA}
        MAIL_USE_TLS=False
        # Añadir otras variables de entorno necesarias para qa
    """
    }

    // Nombre del contenedor a verificar
    def containerNameBack = "backunsushi-qa"

    // Comprobar si el contenedor ya existe
    if (checkContainerExists(containerNameBack)) {
        echo "El contenedor ${containerNameBack} ya existe. Deteniéndolo y eliminándolo..."
        sh "docker stop ${containerNameBack} || true" // Detener el contenedor si está en ejecución
        sh "docker rm ${containerNameBack} || true"   // Eliminar el contenedor
    }

    // Copiar configuración del backend
    sh '''
        #!/bin/bash
        sudo cp www-qa-backend.conf /etc/nginx/sites-available/www-qa-backend.unsushi.com
        if [ -f /etc/nginx/sites-enabled/www-qa-backend.unsushi.com ]; then
            echo "ya está el enlace"
        else
            ln -s /etc/nginx/sites-available/www-qa-backend.unsushi.com /etc/nginx/sites-enabled/www-qa-backend.unsushi.com
        fi
        cd api
        docker build -f Dockerfile.qa -t backunsushi:qa .
        docker run -v /var/www/html/tmp/uploads:/app/uploads -it -e FLASK_ENV=qa -p 4401:4401 --name backunsushi-qa -d backunsushi:qa
        sudo systemctl restart nginx.service
    '''
}

return this