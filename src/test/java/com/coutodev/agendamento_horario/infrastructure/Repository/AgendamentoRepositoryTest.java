package com.coutodev.agendamento_horario.infrastructure.Repository;

import org.junit.jupiter.api.Test;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

import static org.junit.jupiter.api.Assertions.*;
@DataJpaTest
@ActiveProfiles("test")
class AgendamentoRepositoryTest {

    @Test
    void findByServicoAndHorarioAgendamentoBetween() {
    }
}