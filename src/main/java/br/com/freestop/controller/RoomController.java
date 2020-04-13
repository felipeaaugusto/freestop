package br.com.freestop.controller;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.ResponseStatus;

import br.com.freestop.domain.Chat;
import br.com.freestop.domain.Correction;
import br.com.freestop.domain.Player;
import br.com.freestop.domain.Result;
import br.com.freestop.domain.Room;
import br.com.freestop.service.RoomService;

@Controller
@RequestMapping("/room")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class RoomController {

	@Autowired
	RoomService roomService;

	@RequestMapping(method = RequestMethod.POST, produces = { "application/json" })
	public @ResponseBody Room create(@RequestBody Room room) {
		Room newRoom = Room.create(room.getMaxPlayer(), room.getLetters(), room.getRoundTime(), room.getTotalRounds(),
				room.getCategories());
		Room createdRoom = roomService.create(newRoom);
		return createdRoom;
	}

	@RequestMapping(method = RequestMethod.GET, produces = { "application/json" })
	@ResponseStatus(HttpStatus.OK)
	public @ResponseBody List<Room> list() {
		return roomService.list();
	}

	@RequestMapping(path = "{numberRoom}", method = RequestMethod.GET, produces = { "application/json" })
	@ResponseStatus(HttpStatus.OK)
	public @ResponseBody ResponseEntity<Room> getRoom(@PathVariable Long numberRoom) {
		Optional<Room> room = roomService.list().stream().filter(r -> r.getNumber() == numberRoom).findFirst();
		if (room.isEmpty())
			return ResponseEntity.notFound().build();
		return ResponseEntity.ok(room.get());
	}

	@RequestMapping(path = "{numberRoom}/status", method = RequestMethod.GET, produces = { "application/json" })
	@ResponseStatus(HttpStatus.OK)
	public @ResponseBody ResponseEntity<Boolean> getStatusRoom(@PathVariable Long numberRoom) {
		Optional<Room> room = roomService.list().stream().filter(r -> r.getNumber() == numberRoom).findFirst();
		if (room.isEmpty())
			return ResponseEntity.ok(false);
		return ResponseEntity.ok(true);
	}

	@RequestMapping(path = "{numberRoom}/start", method = RequestMethod.POST, produces = { "application/json" })
	public @ResponseBody ResponseEntity<Room> start(@PathVariable Long numberRoom) {
		Optional<Room> roomOptional = roomService.list().stream().filter(r -> r.getNumber() == numberRoom).findFirst();
		if (roomOptional.isEmpty())
			return ResponseEntity.notFound().build();

		Room room = roomOptional.get();

		if (!room.isStarted())
			room.start();
		return ResponseEntity.ok(room);
	}

	@RequestMapping(path = "{numberRoom}/stop/{numberPlayer}", method = RequestMethod.POST, produces = {
			"application/json" })
	public @ResponseBody ResponseEntity<Room> stop(@PathVariable Long numberRoom, @PathVariable Long numberPlayer,
			@RequestBody Result result) {
		Optional<Room> roomOptional = roomService.list().stream().filter(r -> r.getNumber() == numberRoom).findFirst();
		if (roomOptional.isEmpty())
			return ResponseEntity.notFound().build();

		Room room = roomOptional.get();

		Optional<Player> optionalPlayer = room.getPlayers().stream().filter(p -> p.getNumber() == numberPlayer)
				.findFirst();
		if (optionalPlayer.isEmpty())
			return ResponseEntity.notFound().build();

		Player player = optionalPlayer.get();

		room.stop(result, player);
		return ResponseEntity.ok(room);
	}

	@RequestMapping(path = "{numberRoom}/result/{numberPlayer}", method = RequestMethod.POST, produces = {
			"application/json" })
	public @ResponseBody ResponseEntity<Room> result(@PathVariable Long numberRoom, @PathVariable Long numberPlayer,
			@RequestBody Correction correction) {
		Optional<Room> roomOptional = roomService.list().stream().filter(r -> r.getNumber() == numberRoom).findFirst();
		if (roomOptional.isEmpty())
			return ResponseEntity.notFound().build();

		Room room = roomOptional.get();

		Optional<Player> optionalPlayer = room.getPlayers().stream().filter(p -> p.getNumber() == numberPlayer)
				.findFirst();
		if (optionalPlayer.isEmpty())
			return ResponseEntity.notFound().build();

		Player player = optionalPlayer.get();

		room.result(player, correction);
		return ResponseEntity.ok(room);
	}

	@RequestMapping(path = "{numberRoom}/cancel", method = RequestMethod.POST, produces = { "application/json" })
	public @ResponseBody ResponseEntity<Room> cancel(@PathVariable Long numberRoom) {
		Optional<Room> roomOptional = roomService.list().stream().filter(r -> r.getNumber() == numberRoom).findFirst();
		if (roomOptional.isEmpty())
			return ResponseEntity.notFound().build();

		Room room = roomOptional.get();
		roomService.cancel(room);
		return ResponseEntity.ok(room);
	}

	@RequestMapping(path = "{numberRoom}/player", method = RequestMethod.POST, produces = { "application/json" })
	public @ResponseBody ResponseEntity<Player> addPlayer(@PathVariable Long numberRoom, @RequestBody Player player) {
		Optional<Room> roomOptional = roomService.list().stream().filter(r -> r.getNumber() == numberRoom).findFirst();
		if (roomOptional.isEmpty())
			return ResponseEntity.notFound().build();

		Room room = roomOptional.get();
		room.addPlayer(player);
		return ResponseEntity.ok(player);
	}

	@RequestMapping(path = "{numberRoom}/player/{numberPlayer}/remove", method = RequestMethod.POST, produces = {
			"application/json" })
	public @ResponseBody ResponseEntity<Player> removePlayer(@PathVariable Long numberRoom,
			@PathVariable Long numberPlayer) {
		Optional<Room> roomOptional = roomService.list().stream().filter(r -> r.getNumber() == numberRoom).findFirst();
		if (roomOptional.isEmpty())
			return ResponseEntity.notFound().build();
		Room room = roomOptional.get();

		Optional<Player> optionalPlayer = room.getPlayers().stream().filter(p -> p.getNumber() == numberPlayer)
				.findFirst();
		if (optionalPlayer.isEmpty())
			return ResponseEntity.notFound().build();

		Player player = optionalPlayer.get();
		room.removePlayer(player);
		return ResponseEntity.ok(player);
	}

	@RequestMapping(path = "time", method = RequestMethod.GET, produces = { "application/json" })
	@ResponseStatus(HttpStatus.OK)
	public @ResponseBody ResponseEntity<LocalDateTime> getTime() {
		return ResponseEntity.ok(LocalDateTime.now());
	}

	@RequestMapping(path = "{numberRoom}/chat/{numberPlayer}", method = RequestMethod.POST, produces = {
			"application/json" })
	public @ResponseBody ResponseEntity<Chat> addMessageChat(@PathVariable Long numberRoom,
			@PathVariable Long numberPlayer, @RequestBody Chat chat) {
		Optional<Room> roomOptional = roomService.list().stream().filter(r -> r.getNumber() == numberRoom).findFirst();
		if (roomOptional.isEmpty())
			return ResponseEntity.notFound().build();

		Room room = roomOptional.get();

		Optional<Player> optionalPlayer = room.getPlayers().stream().filter(p -> p.getNumber() == numberPlayer)
				.findFirst();
		if (optionalPlayer.isEmpty())
			return ResponseEntity.notFound().build();

		Player player = optionalPlayer.get();

		room.addMessage(chat, player);
		return ResponseEntity.ok(chat);
	}
}
