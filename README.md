# AI Ops Copilot

AI Ops Copilot is an intelligent assistant designed to streamline operational workflows through advanced AI capabilities. It leverages large language models and retrieval-augmented generation (RAG) to provide automated document analysis, intelligent chat interactions, and workflow optimization recommendations.

## Key Features

- **Intelligent Chat**: Interactive conversational interface powered by advanced language models for operational assistance.
- **Document Analysis**: Automated processing, summarization, and action item extraction from various document formats.
- **Workflow Optimization**: AI-driven suggestions for process improvements and automation strategies.
- **Multilingual Support**: Built-in support for English and Japanese to accommodate diverse user bases.
- **Cloud-Native Architecture**: Containerized deployment ready for scalable cloud environments.

## Technology Stack

### Backend
- **Framework**: FastAPI (Python)
- **AI/ML**: Azure AI Inference SDK, Custom RAG implementation
- **Data Processing**: Vector embeddings, Document retrieval systems
- **Authentication**: JWT-based user management

### Frontend
- **Framework**: React with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with custom design system
- **State Management**: React hooks and context

### Infrastructure
- **Containerization**: Docker and Docker Compose
- **Cloud Platform**: Google Cloud Platform (Cloud Run, Container Registry)
- **CI/CD**: Cloud Build integration

## Prerequisites

- Python 3.8 or higher
- Node.js 16 or higher
- Docker and Docker Compose
- Git

## Installation and Setup

### Local Development with Docker

1. Clone the repository:
   ```bash
   git clone https://github.com/Harsh-PAHADIA/ai-ops-copilot.git
   cd ai-ops-copilot
   ```

2. Start the application:
   ```bash
   docker-compose up --build
   ```

3. Access the application at `http://localhost:3000`

### Manual Setup

#### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Start the backend server:
   ```bash
   uvicorn app.main:app --reload
   ```

#### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

## Project Structure

```
ai-ops-copilot/
├── backend/
│   ├── app/
│   │   ├── models/          # Data models
│   │   ├── routes/          # API endpoints
│   │   ├── services/        # Business logic
│   │   ├── rag/            # Retrieval-augmented generation
│   │   └── utils/          # Utility functions
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Application pages
│   │   ├── services/       # API integration
│   │   └── types/          # TypeScript definitions
│   ├── package.json
│   └── vite.config.ts
├── docker-compose.yml
├── cloudbuild.yaml
└── README.md
```

## API Documentation

Once the backend is running, API documentation is available at:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Deployment

### Google Cloud Platform

1. Build and push Docker image to Container Registry:
   ```bash
   gcloud builds submit --config cloudbuild.yaml
   ```

2. Deploy to Cloud Run:
   ```bash
   gcloud run deploy ai-ops-copilot --source . --platform managed
   ```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

For questions or support, please open an issue on GitHub.
