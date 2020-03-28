package br.com.freestop.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

import org.springframework.stereotype.Service;

import br.com.freestop.domain.Room;

@Service
public class RoomService {

	List<Room> rooms;

	public Room create(Room room) {
		if (Objects.isNull(rooms))
			rooms = new ArrayList<>();
		rooms.add(room);
		return room;
	}

	public void cancel(Room room) {
		rooms.remove(room);
	}

	public List<Room> list() {
		return Objects.isNull(rooms) ? new ArrayList<>() : rooms;
	}

}
