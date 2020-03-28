package br.com.freestop.domain;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Round {

	private int number;

	private LocalDateTime dateStart;

	private LocalDateTime dateFinish;

	private char letter;

	private Category category;

	public static Round create(int number, char letter, Category category, int roundTime) {
		Round newRound = new Round();

		newRound.setDateStart(LocalDateTime.now());
		newRound.setDateFinish(LocalDateTime.now().plusSeconds(roundTime));
		newRound.setNumber(number);
		newRound.setCategory(category);
		newRound.setLetter(letter);

		return newRound;
	}

}
