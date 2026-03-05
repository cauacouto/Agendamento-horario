package com.coutodev.agendamento_horario.Service;

import com.coutodev.agendamento_horario.infrastructure.Entity.Agendamento;
import com.coutodev.agendamento_horario.infrastructure.Repository.AgendamentoRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AgendamentoServiceTest {

    @Mock
    private AgendamentoRepository agendamentoRepository;


    @InjectMocks
    private AgendamentoService agendamentoService;



    @Test
    void deveSalvarAgendamentoQuandoHorarioLivre() {
        // Arrange
        Agendamento agendamento = new Agendamento();
        agendamento.setDataHoraAgendamento(LocalDateTime.of(2026, 3, 1, 10, 0));
        agendamento.setServico("barba");

        when(agendamentoRepository
                .findByServicoAndDataHoraAgendamentoBetween(
                        any(),
                        any(),
                        any()
                ))
                .thenReturn(null);

        when(agendamentoRepository.save(any()))
                .thenReturn(agendamento);

        // Act
        Agendamento resultado = agendamentoService.SalvarAgendamento(agendamento);

        // Assert
        assertNotNull(resultado);
        verify(agendamentoRepository, times(1)).save(agendamento);
        //verificar se o metodo save foi chamdo uma vez com esse agendamento
    }

    @Test
    void deveLancarExcecaoQuandoHorarioJaPreenchido() {
        // Arrange
        Agendamento agendamento = new Agendamento();
        agendamento.setDataHoraAgendamento(LocalDateTime.of(2026, 3, 1, 10, 0));
        agendamento.setServico("barba");

        when(agendamentoRepository
                .findByServicoAndDataHoraAgendamentoBetween(
                        any(),
                        any(),
                        any()
                ))
                .thenReturn(new Agendamento());

        // Act & Assert
        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> agendamentoService.SalvarAgendamento(agendamento)
        );

        assertEquals("horario ja esta preenchido", exception.getMessage());
        verify(agendamentoRepository, never()).save(any());
        // verifica se o metodo save não foi chamado nehuma vez 
    }
}