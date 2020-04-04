package br.com.freestop.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(value = HttpStatus.BAD_REQUEST, reason = "Bad Request.")
public class BadRequestException extends HttpStatusException {

	private static final long serialVersionUID = 1L;

	public BadRequestException(final String msg) {
		super(msg, HttpStatus.BAD_REQUEST);
	}

	public BadRequestException(final Exception e) {
		super(e.getMessage(), HttpStatus.BAD_REQUEST);
	}
}
