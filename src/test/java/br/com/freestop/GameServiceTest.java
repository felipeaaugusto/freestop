package br.com.freestop;

import static org.junit.jupiter.api.Assertions.assertEquals;

import org.junit.jupiter.api.Test;

import br.com.freestop.domain.Category;
import br.com.freestop.domain.Game;
import br.com.freestop.domain.Player;
import br.com.freestop.service.GameService;

public class GameServiceTest {

	@Test
	public void create_game_success() {
		Game game = Game.create(2);

		GameService gameService = new GameService();

		Player player1 = Player.create("Felipe Test");
		Player player2 = Player.create("Felipe Test2");

		game.addPlayer(player1);
		game.addPlayer(player2);

		Category category = new Category("Comidas");

		game.addCategory(category);

		gameService.create(game);
		game.start();

		assertEquals(true, game.isStarted());
	}

}
