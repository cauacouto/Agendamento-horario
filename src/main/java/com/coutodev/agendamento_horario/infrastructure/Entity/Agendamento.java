package com.coutodev.agendamento_horario.infrastructure.Entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "agendamento")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Agendamento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)

    private Long id;
    private String servico;
    private String cliente;
    private LocalDateTime HorarioAgendamento;
    private String profissional;
    private LocalDateTime HorarioInsercao;

    @PrePersist
    public void horarioInsercao(){
        this.HorarioInsercao = LocalDateTime.now();


    }
}
