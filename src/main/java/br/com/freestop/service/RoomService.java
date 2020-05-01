package br.com.freestop.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.logging.Logger;

import org.springframework.stereotype.Service;

import br.com.freestop.domain.Room;

@Service
public class RoomService {

	private List<Room> rooms;

	private final static Logger LOGGER = Logger.getLogger(RoomService.class.getName());

	public Room create(Room room) {
		if (Objects.isNull(rooms))
			rooms = new ArrayList<>();
		rooms.add(room);
		return room;
	}

	public void cancel(Room room) {
		LOGGER.info("Expirando sala: " + room);
		rooms.remove(room);
	}

	public List<Room> list() {
		if (Objects.isNull(rooms))
			rooms = new ArrayList<>();
		expire();
		LOGGER.info("Buscando salas iniciais");
		return rooms;
	}

	public void expire() {
		rooms.parallelStream().forEach(r -> {
			if (r.expired())
				cancel(r);
		});
	}
}
