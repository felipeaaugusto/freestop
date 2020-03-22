package br.com.freestop.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Player {

	private String name;

	public static Player create(String nome) {
		Player player = new Player(nome);

		return player;
	}
}
