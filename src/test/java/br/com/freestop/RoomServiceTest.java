package br.com.freestop;

import static org.junit.jupiter.api.Assertions.assertEquals;

import java.util.ArrayList;
import java.util.List;

import org.junit.jupiter.api.Test;

import br.com.freestop.domain.Category;
import br.com.freestop.domain.Player;
import br.com.freestop.domain.Room;
import br.com.freestop.service.RoomService;

public class RoomServiceTest {

	@Test
	public void create_game_success() {
		List<Category> categories = new ArrayList<>();

		categories.add(new Category("Teste 1", true));
		categories.add(new Category("Teste 2", true));

		Room room = Room.create(2, new char[] { 'A', 'B' }, 60, 5, categories);

		RoomService roomService = new RoomService();

		Player player1 = new Player("Felipe Test", true, 1);
		Player player2 = new Player("Felipe Test2", false, 2);

		room.addPlayer(player1);
		room.addPlayer(player2);

		roomService.create(room);
		room.start();

		assertEquals(true, room.isStarted());
	}

}
