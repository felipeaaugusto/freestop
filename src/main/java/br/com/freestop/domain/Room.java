package br.com.freestop.domain;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
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

	public void addCategory(Category category) {
		if (isStarted())
			throw new RuntimeException("It is no longer allowed to add categories to this game.");
		if (Objects.isNull(categories))
			categories = new ArrayList<>();
		categories.add(category);
	}

	public void addLetters(char[] letters) {
		this.letters = letters;
	}

	public void start() {
		if (maxPlayer != players.size())
			throw new RuntimeException("Minimum players not reached");
		if (categories.size() < 2)
			throw new RuntimeException("There are no categories created.");
		if (letters.length < 2)
			throw new RuntimeException("There are no letters created.");
		started = true;
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