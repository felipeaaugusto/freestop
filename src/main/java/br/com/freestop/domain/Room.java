package br.com.freestop.domain;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.Random;
import java.util.stream.Collectors;

import br.com.freestop.exception.BadRequestException;
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

	private List<Chat> chat;

	public void addPlayer(Player player) {
		if (isStarted())
			throw new BadRequestException("Não é permitido adicionar mais jogadores nessa sala.");
		if (Objects.isNull(player.getName()))
			throw new BadRequestException("Por favor, digite o nome do jogador.");
		if (Objects.isNull(players))
			players = new ArrayList<>();
		if (players.size() >= maxPlayer)
			throw new BadRequestException(String.format("Máximo %s de jogadores permitido!", maxPlayer));

		Random random = new Random();
		player.setNumber(random.nextInt(100000));
		players.add(player);
	}

	public void removePlayer(Player player) {
		players.remove(player);
	}

	public void start() {
		if (maxPlayer != players.size())
			throw new BadRequestException("Mínimo de jogadores não atingido.");
		if (categories.size() < 2)
			throw new BadRequestException("Não existem categorias criadas.");
		if (letters.length < 2)
			throw new BadRequestException("Não existem letras criadas");

		if (Objects.isNull(rounds))
			rounds = new ArrayList<>();
		char letter = raffleLetter();
		Round newRound = Round.create(rounds.size() + 1, letter, roundTime);
		rounds.add(newRound);

		started = true;
	}

	public void stop(Result result, Player player) {
		Optional<Round> roundOptional = rounds.stream().filter(r -> !r.isCalculated()).findFirst();

		result.setPlayer(player);

		if (roundOptional.isPresent()) {
			Round round = roundOptional.get();

			if (Objects.isNull(round.getPlayer()))
				round.setPlayer(player);

			if (Objects.isNull(round.getResults()))
				round.setResults(new ArrayList<>());

			// @formatter:off
			List<Result> results = round.getResults().stream()
					.filter(r -> r.getPlayer().getNumber() == player.getNumber())
				.collect(Collectors.toList());
			// @formatter:on

			if (results.isEmpty())
				round.getResults().add(result);

			if (players.size() == round.getResults().size())
				round.setStarted(false);
		}

		started = false;
	}

	public void result(Player player, Correction correction) {
		Optional<Round> roundOptional = rounds.stream().filter(r -> !r.isCalculated()).findFirst();

		correction.setPlayer(player);

		if (roundOptional.isPresent()) {
			Round round = roundOptional.get();

			// @formatter:off
			List<Correction> correctionsMyPlayer = round.getCorrections().stream()
					.filter(p -> p.getPlayer().getNumber() == player.getNumber())
					.collect(Collectors.toList());
			// @formatter:on

			if (correctionsMyPlayer.isEmpty()) {
				round.addCorrections(correction);

				if (this.players.size() == round.getCorrections().size()) {
					round.setCalculated(true);
					List<Result> results = round.getResults();
					List<Correction> corrections = round.getCorrections();
					// TODO melhorar isso
					int correctionsSize = corrections.size() - 1;
					for (Result r : results) {
						for (Category category : r.getCategories()) {
							int correctionsResult = 0;
							for (Correction correctionTmp : corrections) {
								// @formatter:off
								List<Approval> approvals = correctionTmp.getApprovals().stream()
										.filter(a -> a.getPlayer().getNumber() == r.getPlayer().getNumber())
										.collect(Collectors.toList());
								
								List<Checklist> checklists = approvals.stream()
										.flatMap(a -> a.getChecklist().stream())
										.filter(a -> a.getCategory().getValue().equals(category.getValue()))
										.collect(Collectors.toList());
								
								for (Checklist checklist : checklists) {
									correctionsResult = checklist.isValid() ? correctionsResult + 1 : correctionsResult;
								}
								// @formatter:on
							}
							int score = (correctionsResult / correctionsSize) >= 0.5 ? 10 : 0;
							r.addScore(score);
						}
					}
				}
			}
		}
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

	public void addMessage(Chat chat, Player player) {
		if (Objects.isNull(this.chat))
			this.chat = new ArrayList<>();
		chat.setPlayer(player);
		chat.setDate(LocalDateTime.now());
		this.chat.add(chat);
	}

	public static Room create(int maxPlayer, char[] letters, int roundTime, int totalRounds,
			List<Category> categories) {
		Room newRoom = new Room();

		if (maxPlayer <= 1)
			throw new BadRequestException("Mínimo número de jogadores é 2!");
		if (roundTime < 60)
			throw new BadRequestException("Mínimo quantidade de segundos para cada rodada é 60!");
		if (totalRounds < 3)
			throw new BadRequestException("Mínimo número de rodadas é 3!");
		if (letters.length < 2)
			throw new BadRequestException("Mínimo número de letras é 2!");
		if (categories.size() < 2)
			throw new BadRequestException("Mínimo número de categorias é 2!");

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
