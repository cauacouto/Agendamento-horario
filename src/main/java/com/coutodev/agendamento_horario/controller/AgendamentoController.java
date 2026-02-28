package com.coutodev.agendamento_horario.controller;

import com.coutodev.agendamento_horario.Service.AgendamentoService;
import com.coutodev.agendamento_horario.infrastructure.Entity.Agendamento;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/agendamento")
public class AgendamentoController {

    private final AgendamentoService agendamentoService;

    public AgendamentoController(AgendamentoService agendamentoService) {
        this.agendamentoService = agendamentoService;
    }

    @PostMapping
    public ResponseEntity<Agendamento> salvarAgendamento(@RequestBody Agendamento agendamento){
       return ResponseEntity.status(HttpStatus.CREATED).body(agendamentoService.SalvarAgendamento(agendamento));
    }
    @DeleteMapping
    public ResponseEntity<Void> deletarAgendamento(@RequestParam String cliente, LocalDateTime HorarioAgendamento){
        agendamentoService.deleterAgendamento(cliente, HorarioAgendamento);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }

    @GetMapping
    public ResponseEntity<List<Agendamento>> listarAgendamentos(@RequestParam LocalDate date){
        return ResponseEntity.ok().body(agendamentoService.listarAgendamento(date));
    }
    @PutMapping
    public ResponseEntity<Agendamento> alterarAgendamento(@RequestBody Agendamento agendamento,@RequestParam String cliente,LocalDateTime horaAgendada){
        return ResponseEntity.accepted().body(agendamentoService.alterarAgendamento(agendamento, cliente, horaAgendada));

    }
}
