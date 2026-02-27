package com.coutodev.agendamento_horario.infrastructure.Repository;

import com.coutodev.agendamento_horario.infrastructure.Entity.Agendamento;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface AgendamentoRepository extends JpaRepository<Agendamento,Long> {

    Agendamento findByServicoAndHorarioAgendamentoBetween(String servico, LocalDateTime HoraInicio,LocalDateTime HoraFinal);

@Transactional
    void DeleteByDataHoraAgendamentoAndCliente(LocalDateTime dataHoraAgendamento,String cliente);


   Agendamento findyByDataHoraAgendamentoAndCliente(LocalDateTime dataHoraAgendamento,String cliente);

    List<Agendamento> findyByDataHoraAgendamentoBetween(LocalDateTime horarioIncial, LocalDateTime horarioFinal);
}
