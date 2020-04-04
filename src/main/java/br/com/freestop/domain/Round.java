package br.com.freestop.domain;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

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

	private boolean started;

	private boolean calculated;

	private List<Result> results;

	private List<Player> playerFixes;

	public static Round create(int number, char letter, int roundTime) {
		Round newRound = new Round();

		newRound.setDateStart(LocalDateTime.now());
		newRound.setDateFinish(LocalDateTime.now().plusSeconds(roundTime));
		newRound.setNumber(number);
		newRound.setLetter(letter);
		newRound.setStarted(true);

		return newRound;
	}

	public void addPlayerFixes(Player player) {
		if (Objects.isNull(playerFixes))
			playerFixes = new ArrayList<>();
		Optional<Player> playerOptional = playerFixes.stream().filter(p -> p.getNumber() == player.getNumber())
				.findFirst();
		if (playerOptional.isEmpty())
			playerFixes.add(player);
	}

}
