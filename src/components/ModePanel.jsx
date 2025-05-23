import React from 'react';
import { Card, Form, Row, Col } from 'react-bootstrap';

const ModePanel = ({ mode, onModeChange, rangeCardStart, onRangeCardStartChange, rangeCardStep, onRangeCardStepChange, unit, onUnitChange }) => {
  return (
    <Card className="mb-4 w-100">
      <Card.Header as="h5">Mode</Card.Header>
      <Card.Body>
          <Form.Group as={Row} className="mb-3" controlId="modeSwitch">
            <Form.Label column sm="4">Display Mode</Form.Label>
            <Col sm="8">
              <Form.Check
                inline
                label="HUD"
                type="radio"
                name="displayMode"
                id="hud-mode"
                checked={mode === 'HUD'}
                onChange={() => onModeChange('HUD')}
              />
              <Form.Check
                inline
                label="Range Card"
                type="radio"
                name="displayMode"
                id="range-card-mode"
                checked={mode === 'RANGE_CARD'}
                onChange={() => onModeChange('RANGE_CARD')}
              />
            </Col>
          </Form.Group>

          {mode === 'RANGE_CARD' && (
            <>
              <Form.Group as={Row} className="mb-3" controlId="rangeCardStart">
                <Form.Label column sm="4">Range Card Start</Form.Label>
                <Col sm="8" className="d-flex align-items-center">
                  <Form.Control
                    type="number"
                    value={rangeCardStart || ''}
                    onChange={e => onRangeCardStartChange(e.target.value)}
                    min="0"
                    className="me-2 w-100"
                    style={{ minWidth: 120 }}
                  />
                  <Form.Select
                    value={unit}
                    onChange={e => onUnitChange(e.target.value)}
                    style={{ width: 'auto' }}
                  >
                    <option value="YARDS">Yards</option>
                    <option value="METERS">Meters</option>
                  </Form.Select>
                </Col>
              </Form.Group>
              <Form.Group as={Row} className="mb-3" controlId="rangeCardStep">
                <Form.Label column sm="4">Range Card Step</Form.Label>
                <Col sm="8" className="d-flex align-items-center">
                  <Form.Control
                    type="number"
                    value={rangeCardStep || ''}
                    onChange={e => onRangeCardStepChange(e.target.value)}
                    min="1"
                    className="me-2 w-100"
                    style={{ minWidth: 120 }}
                  />
                  <Form.Select
                    value={unit}
                    onChange={e => onUnitChange(e.target.value)}
                    style={{ width: 'auto' }}
                  >
                    <option value="YARDS">Yards</option>
                    <option value="METERS">Meters</option>
                  </Form.Select>
                </Col>
              </Form.Group>
            </>
          )}
        
      </Card.Body>
    </Card>
  );
};

export default ModePanel;
