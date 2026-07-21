# Implement masked attention

Apply the causal mask to scores before stable softmax. The starter zeros future
probabilities afterwards, so its rows no longer sum to one.
