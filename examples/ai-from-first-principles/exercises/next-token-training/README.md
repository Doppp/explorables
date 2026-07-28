# Implement shifted next-token training

Build input-target pairs where position `t` predicts the token at `t + 1`,
average stable cross-entropy over those positions, and apply the accumulated
gradient to a token-transition matrix.

The starter labels each token with itself, rewarding copying instead of
next-token prediction.
