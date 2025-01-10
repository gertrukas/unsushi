// Definición de la función fuera del bloque `script`
def checkContainerExists(containerName) {
    return sh(script: "docker ps -a --filter 'name=${containerName}' --format '{{.Names}}'", returnStdout: true).trim() == containerName
}

pipeline {
    agent any
    tools {nodejs "NodeJS"}
    triggers {
        githubPush()
    }
    stages {
        stage('Build Site') {
            steps {
                script {
                    echo "Current branch: ${env.BRANCH_NAME}"
                    if (env.BRANCH_NAME == 'qa') {
                        def functionSiteQa = evaluate(readFile('jenkinsfile_qa.groovy'))
                        functionSiteQa.runSite()
                    } else if (env.BRANCH_NAME == 'main') {
                        def functionSiteProd = evaluate(readFile('jenkinsfile_main.groovy'))
                        functionSiteProd.runSite()
                    } else {
                        echo 'No specific script for this branch.'
                    }
                }
            }
        }
        stage('Build Admin') {
            steps {
                script {
                    echo "Current branch: ${env.BRANCH_NAME}"
                    if (env.BRANCH_NAME == 'qa') {
                        def functionAdminQa = evaluate(readFile('jenkinsfile_qa.groovy'))
                        functionAdminQa.runAdmin()
                    } else if (env.BRANCH_NAME == 'main') {
                        def functionAdminProd = evaluate(readFile('jenkinsfile_main.groovy'))
                        functionAdminProd.runAdmin()
                    } else {
                        echo 'No specific script for this branch.'
                    }
                }
            }
        }
        stage('Build BackEnd') {
            steps {
                script {
                    echo "Current branch: ${env.BRANCH_NAME}"
                    if (env.BRANCH_NAME == 'qa') {
                        def functionBackQa = evaluate(readFile('jenkinsfile_qa.groovy'))
                        functionBackQa.runBack()
                    } else if (env.BRANCH_NAME == 'main') {
                        def functionBackProd = evaluate(readFile('jenkinsfile_main.groovy'))
                        functionBackProd.runBack()
                    } else {
                        echo 'No specific script for this branch.'
                    }
                }
            }
        }
    }
}