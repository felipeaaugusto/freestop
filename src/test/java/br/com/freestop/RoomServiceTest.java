package br.com.freestop;

import static org.junit.jupiter.api.Assertions.assertEquals;

import java.util.ArrayList;
import java.util.List;

import org.junit.jupiter.api.Test;

import br.com.freestop.domain.Approval;
import br.com.freestop.domain.Category;
import br.com.freestop.domain.Checklist;
import br.com.freestop.domain.Correction;
import br.com.freestop.domain.Player;
import br.com.freestop.domain.Result;
import br.com.freestop.domain.Room;
import br.com.freestop.service.RoomService;

public class RoomServiceTest {

	@Test
	public void create_game_success() {
		List<Category> categories = new ArrayList<>();

		categories.add(new Category("test_1"));
		categories.add(new Category("test_1"));

		Room room = Room.create(2, new char[] { 'A', 'B' }, 60, 5, categories);

		RoomService roomService = new RoomService();

		Player player1 = new Player("Felipe Test", true, 1);
		Player player2 = new Player("Felipe Test2", false, 2);

		room.addPlayer(player1);
		room.addPlayer(player2);

		roomService.create(room);

		assertEquals(false, room.isStarted());
	}

	@Test
	public void start_game_success() {
		List<Category> categories = new ArrayList<>();

		categories.add(new Category("test_1"));
		categories.add(new Category("test_2"));

		Room room = Room.create(2, new char[] { 'A', 'B' }, 60, 5, categories);

		RoomService roomService = new RoomService();

		Player player1 = new Player("Felipe Test", true, 1);
		Player player2 = new Player("Felipe Test2", false, 2);

		room.addPlayer(player1);
		room.addPlayer(player2);

		roomService.create(room);
		room.start();

		assertEquals(true, room.isStarted());
		assertEquals(1, room.getRounds().size());
	}

	@Test
	public void start_round_success() {
		List<Category> categories = new ArrayList<>();

		categories.add(new Category("test_1"));
		categories.add(new Category("test_2"));

		Room room = Room.create(2, new char[] { 'A', 'B' }, 60, 5, categories);

		RoomService roomService = new RoomService();

		Player player1 = new Player("Player One", true, 1);
		Player player2 = new Player("Player Two", false, 2);

		room.addPlayer(player1);
		room.addPlayer(player2);

		roomService.create(room);
		room.start();

		assertEquals(true, room.isStarted());
		assertEquals(1, room.getRounds().size());

		Result result1 = Result.builder()
				.categories(List.of(new Category("test_1", "value_1"), new Category("test_2", "value_2"))).build();
		room.stop(result1, player1);

		Result result2 = Result.builder()
				.categories(List.of(new Category("test_1", "value_1"), new Category("test_2", "value_2"))).build();
		room.stop(result2, player2);

		// @formatter:off

		Correction correctionPlayer1 = Correction.builder()
				.approvals(List.of(
					new Approval(player2, List.of(
						new Checklist(new Category("test_1", "value_1"), true),
						new Checklist(new Category("test_2", "value_2"), true))
					)))
				.build();


		// @formatter:on

		room.result(player1, correctionPlayer1);

		// @formatter:off

		Correction correctionPlayer2 = Correction.builder()
				.approvals(List.of(
					new Approval(player1, List.of(
						new Checklist(new Category("test_1", "value_1"), true),
						new Checklist(new Category("test_2", "value_2"), true))
					)))
				.build();

		// @formatter:on

		room.result(player2, correctionPlayer2);
	}

}
