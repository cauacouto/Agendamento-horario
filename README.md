[README.md](https://github.com/user-attachments/files/25780902/README.md)
<div align="center">

# 📅 Agendamento Horário

**Sistema completo de agendamento de horários para barbearias e salões**

![Java](https://img.shields.io/badge/Java-21-orange?style=for-the-badge&logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-4.0-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)
![React](https://img.shields.io/badge/React-TypeScript-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white)

</div>

---

## 🛠️ Stack

<table>
  <tr>
    <td><strong>Backend</strong></td>
    <td>Java 21 · Spring Boot · Spring Data JPA · H2 Database · Maven</td>
  </tr>
  <tr>
    <td><strong>Frontend</strong></td>
    <td>React · TypeScript · Vite</td>
  </tr>
  <tr>
    <td><strong>Infra</strong></td>
    <td>Docker · Docker Compose · Docker Hub</td>
  </tr>
</table>

---

## 📁 Estrutura

```
agendamento-horario/
├── 📂 src/                     # Backend Spring Boot
│   └── main/java/
│       ├── controller/
│       ├── infrastructure/
│       │   ├── Entity/
│       │   └── Repository/
│       └── Service/
├── 📂 frontend/                # Frontend React TypeScript
│   ├── src/App.tsx
│   ├── Dockerfile
│   └── package.json
├── 🐳 Dockerfile
├── 🐳 docker-compose.yml
└── 📦 pom.xml
```

---

## 🚀 Como Rodar

### 🐳 Com Docker _(recomendado)_

> Apenas o [Docker Desktop](https://www.docker.com/products/docker-desktop/) é necessário.

```bash
# Clone o repositório
git clone https://github.com/cauacouto/Agendamento-horario.git
cd Agendamento-horario

# Suba tudo com um comando
docker-compose up --build
```

| Serviço | URL |
|---------|-----|
| 🌐 Frontend | http://localhost:5173 |
| ⚙️ Backend | http://localhost:8081 |
| 🗄️ H2 Console | http://localhost:8081/h2-console |

---

### 💻 Sem Docker

**Backend**
```bash
./mvnw spring-boot:run
```

**Frontend**
```bash
cd frontend
npm install
npm run dev
```

---

## 📡 API

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/agendamento?date={date}` | Lista agendamentos por data |
| `POST` | `/agendamento` | Cria novo agendamento |
| `PUT` | `/agendamento?cliente={c}&horaAgendada={h}` | Edita agendamento |
| `DELETE` | `/agendamento?cliente={c}&HorarioAgendamento={h}` | Remove agendamento |

**Exemplo de payload:**
```json
{
  "cliente": "João Silva",
  "servico": "Corte",
  "profissional": "Carlos",
  "dataHoraAgendamento": "2026-03-05T09:00:00"
}
```

---

## ✨ Funcionalidades

- 🕐 Timeline de horários das **07h às 20h**
- ➕ Criar, editar e excluir agendamentos
- 🚫 Validação de **horário duplicado** por serviço (bloqueio de 1h)
- 🎨 Cards **coloridos por profissional**
- 📋 Seção de **próximos agendamentos**
- 📊 **Estatísticas** do dia em tempo real

---

## 🐳 Docker Hub

```bash
docker pull cauacouto/agendamento-backend:latest
docker pull cauacouto/agendamento-frontend:latest
```

---

<div align="center">

Feito por [Caua Couto](https://github.com/cauacouto)

</div>
