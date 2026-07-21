# Build a nucleus distribution

Scale logits by temperature, normalise stably, sort by probability, retain the
smallest prefix reaching `topP`, and renormalise. The starter accumulates in
vocabulary order.
