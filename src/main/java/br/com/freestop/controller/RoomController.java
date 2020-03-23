package br.com.freestop.controller;

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

import br.com.freestop.domain.Player;
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
		Room createdRoom = roomService.create(Room.create(room.getMaxPlayer()));
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

	@RequestMapping(path = "{numberRoom}/player", method = RequestMethod.POST, produces = { "application/json" })
	public @ResponseBody ResponseEntity<Player> addPlayer(@PathVariable Long numberRoom, @RequestBody Player player) {
		Optional<Room> roomOptional = roomService.list().stream().filter(r -> r.getNumber() == numberRoom).findFirst();
		if (roomOptional.isEmpty())
			return ResponseEntity.notFound().build();

		Room room = roomOptional.get();
		room.addPlayer(player);
		return ResponseEntity.ok(player);
	}

}
