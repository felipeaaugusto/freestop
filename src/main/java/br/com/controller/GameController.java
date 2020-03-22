package br.com.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

import br.com.freestop.domain.Game;
import br.com.freestop.service.GameService;

@Controller
@RequestMapping("/game")
public class GameController {

	@Autowired
	GameService gameService;

	@RequestMapping(method = RequestMethod.POST)
	public void create(Game game) {
		gameService.create(game);
	}

	@RequestMapping(method = RequestMethod.GET)
	public List<Game> list() {
		return gameService.list();
	}

}
