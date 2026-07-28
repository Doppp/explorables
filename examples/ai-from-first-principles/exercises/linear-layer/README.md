# Implement a linear-layer forward pass

Complete `linearLayer` for `y = Wx + b`. Treat each weight row as one output,
validate every dimension before calculating, and reject non-finite inputs. The
starter incorrectly treats weight columns as outputs.

After the tests pass, explain why `W` with shape `[outputs × inputs]` produces
one output per row.
