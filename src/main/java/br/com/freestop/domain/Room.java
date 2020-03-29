package br.com.freestop.domain;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.Random;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Room {

	private int number;

	private int maxPlayer;

	private int roundTime;

	private int totalRounds;

	private List<Player> players;

	private List<Category> categories;

	private List<Round> rounds;

	private char[] letters;

	private boolean started;

	public void addPlayer(Player player) {
		if (isStarted())
			throw new RuntimeException("It is no longer allowed to add players to this game.");
		if (Objects.isNull(players))
			players = new ArrayList<>();
		if (players.size() >= maxPlayer)
			throw new RuntimeException(String.format("Maximum number of players %s allowed!", maxPlayer));

		Random random = new Random();
		player.setNumber(random.nextInt(100000));
		players.add(player);
	}

	public void removePlayer(Player player) {
		players.remove(player);
	}

	public void start() {
		if (maxPlayer != players.size())
			throw new RuntimeException("Minimum players not reached");
		if (categories.size() < 2)
			throw new RuntimeException("There are no categories created.");
		if (letters.length < 2)
			throw new RuntimeException("There are no letters created.");

		if (Objects.isNull(rounds))
			rounds = new ArrayList<>();
		char letter = raffleLetter();
		Round newRound = Round.create(rounds.size() + 1, letter, roundTime);
		rounds.add(newRound);

		started = true;
	}

	public void stop() {
		Optional<Round> roundOptional = rounds.stream().filter(r -> r.isStarted()).findFirst();

		if (roundOptional.isPresent())
			roundOptional.get().setStarted(false);

		started = false;
	}

	private char raffleLetter() {
		Random random = new Random();
		char letterRaffled = 0;
		do {
			int randomNumber = random.nextInt(letters.length);
			final char letter = letters[randomNumber];
			Optional<Round> roundPlayed = rounds.stream().filter(l -> l.equals(letter)).findFirst();
			if (roundPlayed.isEmpty()) {
				letterRaffled = letter;
			}
		} while (letterRaffled == 0);

		return letterRaffled;
	}

	public static Room create(int maxPlayer, char[] letters, int roundTime, int totalRounds,
			List<Category> categories) {
		Room newRoom = new Room();

		if (maxPlayer <= 1)
			throw new RuntimeException("Minimum number of players is 2!");
		if (roundTime < 60)
			throw new RuntimeException("Minimum number of round time is 60!");
		if (totalRounds < 3)
			throw new RuntimeException("Minimum number of rounds is 3!");
		if (letters.length < 2)
			throw new RuntimeException("Minimum number of letters is 2!");
		if (categories.size() < 2)
			throw new RuntimeException("Minimum number of categories is 2!");

		Random random = new Random();

		newRoom.setNumber(random.nextInt(100000));
		newRoom.setMaxPlayer(maxPlayer);
		newRoom.setLetters(letters);
		newRoom.setRoundTime(roundTime);
		newRoom.setTotalRounds(totalRounds);
		newRoom.setCategories(categories);

		return newRoom;
	}
}
