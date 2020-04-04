package br.com.freestop.exception;

import org.springframework.http.HttpStatus;

public class HttpStatusException extends RuntimeException {
	private static final long serialVersionUID = -6851973017070929937L;
	private final HttpStatus status;
	private final String errorCode;

	public HttpStatusException(final String msg, final HttpStatus status) {
		super(msg);
		this.status = status;
		this.errorCode = null;
	}

	public HttpStatusException(final String msg, final HttpStatus status, String errorCode) {
		super(msg);
		this.status = status;
		this.errorCode = errorCode;
	}

	public HttpStatusException(final String msg, Throwable t, HttpStatus status) {
		super(msg, t);
		this.status = status;
		this.errorCode = null;
	}

	public HttpStatusException(final String msg, Throwable t, HttpStatus status, String errorCode) {
		super(msg, t);
		this.status = status;
		this.errorCode = errorCode;
	}

	public HttpStatus getStatus() {
		return this.status;
	}

	public String getErrorCode() {
		return this.errorCode;
	}
}