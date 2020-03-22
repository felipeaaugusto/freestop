package br.com.freestop.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

import org.springframework.stereotype.Service;

import br.com.freestop.domain.Game;

@Service
public class GameService {

	List<Game> games;

	public void create(Game game) {
		if (Objects.isNull(games))
			games = new ArrayList<>();
		games.add(game);
	}

	public List<Game> list() {
		return games;
	}

}
