package br.com.freestop.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Category {

	private String value;

	private String word;

	public Category(String value) {
		this.value = value;
	}
}
