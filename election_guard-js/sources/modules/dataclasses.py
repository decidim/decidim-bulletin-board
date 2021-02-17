def dataclass(func):
  return func

def field(default = None, default_factory = None, init = True):
  if default_factory:
    return default_factory()
  else:
    return default

def InitVar(func):
  return func

def replace(func):
  return func