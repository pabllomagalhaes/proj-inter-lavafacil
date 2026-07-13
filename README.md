🚗 LavaFácil Web

Sistema web desenvolvido como projeto interdisciplinar da 3ª fase do curso de Análise e Desenvolvimento de Sistemas (IFC - Câmpus Fraiburgo). O projeto visa modernizar a gestão de lava-jatos, substituindo métodos manuais por uma plataforma digital de agendamento e controle de pátio.
🚀 Tecnologias Utilizadas
Frontend

    React com TypeScript e Vite

    Tailwind CSS para estilização responsiva

    React Router para navegação SPA

    Lucide React para ícones

Backend

    Java com Spring Boot

    API RESTful para comunicação

    MySQL como banco de dados

    Padrão DAO para persistência de dados

🛠 Funcionalidades Principais

    Para o Cliente:

        Cadastro de usuários e veículos.

        Agendamento de serviços com precificação dinâmica.

        Filtros inteligentes (ex: ocultação de serviços incompatíveis com a categoria do veículo).

        Acompanhamento de status em tempo real.

    Para o Administrador:

        Painel executivo completo.

        Gestão de fila (pátio) usando estrutura de dados de Fila (Queue).

        CRUD de serviços e categorias.

        Configuração de calendário e controle de capacidade (slots).

🧠 Desafios Técnicos e Aprendizados

O projeto foi um desafio de integração entre tecnologias distintas. Os principais pontos que trabalhamos foram:

    Integração Frontend-Backend: Solução de problemas de CORS e sincronização de formatos de data/hora entre JSON e LocalDateTime.

    Estrutura de Dados: Implementação de uma Fila (FIFO) para controle do pátio, garantindo consistência entre a memória do servidor e a persistência no MySQL.

    Controle de Versão: Gestão colaborativa via GitHub, enfrentando conflitos de merge e padronizando commits para manter a rastreabilidade do código.

👥 Equipe

    Arthur Caminski

    Fernando Mello

    Matheus Mozzer

    Pablo Anjos

Projeto Interdisciplinar - IFC Fraiburgo - 2026