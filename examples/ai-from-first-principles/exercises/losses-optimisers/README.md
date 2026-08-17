# Implement stable loss and a momentum update

Complete stable softmax, cross-entropy, global-norm clipping, and a stateful momentum update with decoupled weight decay. The starter exponentiates raw logits, clips each component separately, and recreates momentum on every step.

After the tests pass, explain why adding one constant to every logit leaves the loss unchanged and why momentum must survive between calls.
