pipeline {
    agent any

    options {
        timestamps()
        disableConcurrentBuilds()
        buildDiscarder(logRotator(numToKeepStr: '10'))
    }

    environment {
        // ---- EDIT THESE ----
        DEPLOY_HOST = 'ec2-user@15.223.250.253'   // user@host of the web server
        DEPLOY_PATH = '/var/www/html'            // web root on the server
        SSH_CRED_ID = 'git-webserver-ssh-key'        // Jenkins credential ID (SSH private key)
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build') {
            steps {
                sh '''
                    rm -rf dist && mkdir -p dist
                    if [ -f package.json ]; then
                        # Node-based site (React, Vue, Hugo wrapper, etc.)
                        npm ci
                        npm run build          # must output to ./dist (adjust if needed)
                    else
                        # Plain HTML/CSS/JS site: copy everything except repo/CI files
                        rsync -a --exclude='.git' --exclude='.gitignore' --exclude='README.md' --exclude='Jenkinsfile' --exclude='dist' ./ dist/
                    fi
                '''
            }
        }

        stage('Test') {
            steps {
                sh '''
                    test -f dist/index.html || (echo "index.html missing in build output" && exit 1)
                '''
            }
        }

        stage('Archive') {
            steps {
                archiveArtifacts artifacts: 'dist/**', fingerprint: true
            }
        }

        stage('Deploy') {
            when {
                // Multibranch: BRANCH_NAME; regular Pipeline job: GIT_BRANCH
                expression { env.BRANCH_NAME == 'main' || env.GIT_BRANCH == 'origin/main' }
            }
            steps {
                sshagent(credentials: [env.SSH_CRED_ID]) {
                    sh '''
                        rsync -avz --delete \
                          -e "ssh -o StrictHostKeyChecking=accept-new" \
                          dist/ ${DEPLOY_HOST}:${DEPLOY_PATH}/
                    '''
                }
            }
        }
    }

    post {
        success { echo 'Build and deploy finished successfully.' }
        failure { echo 'Pipeline failed. Check the console output.' }
    }
}
