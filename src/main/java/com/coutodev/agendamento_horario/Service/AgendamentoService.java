package com.coutodev.agendamento_horario.Service;

import com.coutodev.agendamento_horario.infrastructure.Entity.Agendamento;
import com.coutodev.agendamento_horario.infrastructure.Repository.AgendamentoRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;

@Service

public class AgendamentoService {

    private final AgendamentoRepository agendamentoRepository;

    public AgendamentoService(AgendamentoRepository agendamentoRepository) {
        this.agendamentoRepository = agendamentoRepository;
    }

    @Transactional
    public Agendamento SalvarAgendamento(Agendamento agendamento){
        LocalDateTime horaAgendamento = agendamento.getDataHoraAgendamento();
        LocalDateTime horaFim = agendamento.getDataHoraAgendamento().plusHours(1);

        Agendamento agendados = agendamentoRepository.findByServicoAndDataHoraAgendamentoBetween(agendamento.getServico(),horaAgendamento,horaFim);

        if (Objects.nonNull(agendados)){
            throw new RuntimeException("horario ja esta preenchido");
        }
        return agendamentoRepository.save(agendamento);
    }

    public void deleterAgendamento(String cliente,LocalDateTime HorarioAgendamento){

        agendamentoRepository.deleteByDataHoraAgendamentoAndCliente(HorarioAgendamento,cliente);
    }
    @Transactional
    public Agendamento alterarAgendamento(Agendamento agendamento,String cliente, LocalDateTime horaAgendada){

        Agendamento agenda =  agendamentoRepository.findByDataHoraAgendamentoAndCliente(horaAgendada,cliente);

        if (Objects.isNull(agenda)){
            throw new RuntimeException("horario não esta preenchido");
        }
        agendamento.setId(agenda.getId());
        return agendamentoRepository.save(agendamento);
    }

    public List<Agendamento> listarAgendamento(LocalDate date){

        LocalDateTime primeiraHora = date.atStartOfDay();
        LocalDateTime ultimaHora = date.atTime(23,59,59);

        return agendamentoRepository.findByDataHoraAgendamentoBetween(primeiraHora,ultimaHora);
    }
}
