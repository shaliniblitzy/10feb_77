# 10feb_77

This repository hosts **archie-job-reverse-file-mapper** — a Python 3.12 LangGraph-based document/file generation
system that runs as a Google Cloud Run Job. The application source lives under `app/`; this README documents the
automated testing infrastructure introduced for the project.

## Running Tests

The project uses [`pytest`](https://docs.pytest.org/) as its canonical test framework with the `pytest-cov`,
`pytest-mock`, and `pytest-asyncio` plugins. Test discovery is driven by the top-level `pytest.ini` and coverage
behaviour by `.coveragerc` at the repository root.

### Prerequisites

- **Python 3.12** is required (per Constraint C-006). All pinned test dependencies have been validated against this
  runtime.
- Test dependencies are listed in `requirements-dev.txt` at the repository root. They are intentionally **not**
  added to `app/requirements.txt`, which remains the lean manifest used to build the production Docker image.
- The production runtime dependency `blitzy-platform-shared` remains pinned in `app/requirements.txt`. It is
  mirrored into `requirements-dev.txt` for local development via the `-r app/requirements.txt` directive at the
  bottom of that file, so a single install command pulls down both the test stack and the application runtime.

### Installation

Install all test and runtime dependencies in one step from the repository root:

```bash
pip install -r requirements-dev.txt
```

The equivalent Makefile target is also available:

```bash
make -C app install-dev
```

### Canonical Test Commands

The table below lists the canonical commands developers and CI use to invoke the test suite. Run all commands from
the repository root.

| Purpose | Command |
|---|---|
| Run full test suite | `pytest` |
| Run with coverage (terminal) | `pytest --cov=app --cov-report=term-missing` |
| Run with coverage (XML for CI) | `pytest --cov=app --cov-report=xml --cov-fail-under=15` |
| Run with HTML coverage report | `pytest --cov=app --cov-report=html` |
| Run only unit tests | `pytest -m unit` |
| Run a single test file | `pytest tests/unit/test_models.py` |
| Run a single test function | `pytest tests/unit/test_models.py::test_<name>` |
| Verbose output | `pytest -v` |
| Stop on first failure | `pytest -x` |
| Run last failed tests | `pytest --lf` |

Equivalent Makefile targets (which delegate to `pytest` with the appropriate flags) are exposed via `app/Makefile`:

```bash
make -C app test         # run the full test suite
make -C app test-cov     # run with coverage (terminal + XML, enforces --cov-fail-under=15)
make -C app test-html    # run with coverage and emit an HTML report under htmlcov/
make -C app test-unit    # run only tests marked @pytest.mark.unit
```

### Test Layout

Tests live in a top-level `tests/` directory, kept separate from the application source under `app/`:

```text
tests/
├── __init__.py
├── conftest.py              # project-wide fixtures
├── unit/
│   ├── __init__.py
│   ├── conftest.py          # unit-test-specific fixtures
│   ├── test_models.py       # Pydantic model unit tests
│   ├── test_state.py        # TypedDict state schema tests
│   ├── test_main.py         # event payload parsing tests
│   └── test_prompts.py      # prompt template structural tests
└── fixtures/
    ├── __init__.py
    ├── document_data.py     # model test data factories
    ├── state_data.py        # state test data factories
    ├── event_payloads.py    # EVENT_DATA JSON fixtures
    └── mock_services.py     # external-service mock factories
```

### Coverage Targets

Coverage is measured via `pytest-cov` and `coverage.py` and reported through both terminal output and CI artifacts.

- **Project-wide CI gate**: a minimum of **15%** coverage is enforced via `--cov-fail-under=15` on the CI command
  line and the `fail_under = 15` setting in `.coveragerc`. This threshold reflects the pragmatic 15–25% target for
  this codebase, approximately 85% of which is non-deterministic LLM-driven orchestration with very low
  unit-testability.
- **Per-module targets** (observable via `coverage.py` reports; not enforced individually as CI failures):
  - `app/lib/reverse_document/models.py` — **100%** (pure Pydantic models with no external dependencies)
  - `app/lib/reverse_document/state.py` — **100%** (pure TypedDict definition)
  - `app/main.py` event-parsing branch — **80%+** (`EVENT_DATA` parsing and `BackpropChangeMode` resolution)
  - `app/lib/reverse_document/prompts.py` — structural validation only (string constants: non-emptiness,
    placeholder presence, persona-prompt cross-consistency)
- **Excluded from initial coverage scope** (configured in the `[run] omit` section of `.coveragerc`):
  - `app/lib/reverse_document/helper.py` — LangGraph orchestration with 10+ external-service dependencies; deferred
    to a future integration-testing phase
  - `app/lib/reverse_document/doc.py` — static reference text data with no logic to test
  - All existing manual scripts under `app/` (`*.test.py`, `test_*.py`, `simulate_*.py`, `set_env.py`,
    `mock_tech_spec.py`)

### Continuous Integration

The test job runs automatically on every push to the `qa` branch via `.github/workflows/deploy-job.yml`. It sets up
Python 3.12, installs `requirements-dev.txt`, executes
`pytest --cov=app --cov-report=xml --cov-report=term-missing --cov-fail-under=15`, and uploads the resulting
`coverage.xml` as a build artifact. The existing build job declares `needs: test`, so a test failure or coverage
shortfall halts the pipeline before any Docker image is built or deployed.
