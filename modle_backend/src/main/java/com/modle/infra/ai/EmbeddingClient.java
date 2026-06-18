package com.modle.infra.ai;

import java.util.List;

public interface EmbeddingClient {

    List<Double> embed(String input);
}
