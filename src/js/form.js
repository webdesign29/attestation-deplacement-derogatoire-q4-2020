import 'bootstrap/dist/css/bootstrap.min.css'

import '../css/main.css'

import formData from '../form-data.json'

import { $, appendTo, createElement } from './dom-utils'

// Nettoie les URI fragments
// eslint-disable-next-line prefer-const
let hashParams = {}
window.location.hash.substr(1).split(';').forEach(elem => {
  elem = decodeURI(elem)
  const I = elem.indexOf(':')
  const parts = [elem.slice(0, I), elem.slice(I + 1)]
  hashParams[parts[0]] = parts[1]
})

const createTitle = () => {
  const h2 = createElement('h2', { className: 'titre-2', innerHTML: 'Remplissez en ligne votre déclaration numérique : ' })
  const p = createElement('p', { className: 'msg-info', innerHTML: 'Tous les champs sont obligatoires.' })
  return [h2, p]
}
// createElement('div', { className: 'form-group' })

const createFormGroup = ({
  autocomplete = false,
  autofocus = false,
  inputmode,
  label,
  max,
  min,
  maxlength,
  minlength,
  name,
  pattern,
  placeholder = '',
  type = 'text',
}) => {
  const formGroup = createElement('div', { className: 'form-group' })
  const labelAttrs = {
    for: `field-${name}`,
    id: `field-${name}-label`,
    innerHTML: label,
  }
  const labelEl = createElement('label', labelAttrs)

  const inputGroup = createElement('div', { className: 'input-group align-items-center' })
  const inputAttrs = {
    autocomplete,
    autofocus,
    className: 'form-control',
    id: `field-${name}`,
    inputmode,
    min,
    max,
    minlength,
    maxlength,
    name,
    pattern,
    placeholder,
    required: true,
    type,
  }

  if (hashParams[name] && !name.toUpperCase().includes('CREATION')) {
    inputAttrs.value = hashParams[name]
  }
  const input = createElement('input', inputAttrs)

  const validityAttrs = {
    className: 'validity',
  }
  const validity = createElement('span', validityAttrs)

  const appendToFormGroup = appendTo(formGroup)
  appendToFormGroup(labelEl)
  appendToFormGroup(inputGroup)

  const appendToInputGroup = appendTo(inputGroup)
  appendToInputGroup(input)
  appendToInputGroup(validity)

  return formGroup
}

const createReasonField = (reasonData) => {
  const formReasonAttrs = { className: 'form-checkbox align-items-center' }
  const formReason = createElement('div', formReasonAttrs)
  const appendToReason = appendTo(formReason)

  const id = `checkbox-${reasonData.code}`
  const inputReasonAttrs = {
    className: 'form-check-input',
    type: 'checkbox',
    id,
    name: 'field-reason',
    value: reasonData.code,
  }
  const inputReason = createElement('input', inputReasonAttrs)

  const labelAttrs = { innerHTML: reasonData.label, className: 'form-checkbox-label', for: id }
  const label = createElement('label', labelAttrs)

  appendToReason([inputReason, label])
  return formReason
}

const createReasonFieldset = (reasonsData) => {
  const fieldsetAttrs = {
    id: 'reason-fieldset',
    className: 'fieldset',
  }

  const fieldset = createElement('fieldset', fieldsetAttrs)
  const appendToFieldset = appendTo(fieldset)

  const legendAttrs = {
    className: 'legend titre-3 ',
    innerHTML: 'Choisissez un motif de déplacement',
  }
  const legend = createElement('legend', legendAttrs)

  const textAlertAttrs = { className: 'msg-alert hidden', innerHTML: 'Veuillez choisir un motif' }
  const textAlert = createElement('p', textAlertAttrs)

  const textSubscribeReasonAttrs = {
    innerHTML: `certifie que mon déplacement est lié au motif suivant (cocher la case) autorisé en application des 
    mesures générales nécessaires pour faire face à l'épidémie de Covid19 dans le cadre de l'état 
    d'urgence sanitaire <a class="footnote" id="footnote1" href="#footnote1">[1]</a>&nbsp;:`,
  }

  const textSubscribeReason = createElement('p', textSubscribeReasonAttrs)

  const reasonsFields = reasonsData.items.map(createReasonField)

  appendToFieldset([legend, textAlert, textSubscribeReason, ...reasonsFields])
  // Créer un form-checkbox par motif
  return fieldset
}

export function createForm () {
  const form = $('#form-profile')
  // Évite de recréer le formulaire s'il est déjà créé par react-snap (ou un autre outil de prerender)
  if (form.innerHTML !== '') {
    return
  }

  const appendToForm = appendTo(form)

  const formFirstPart = formData
    .flat(1)
    .filter(field => field.key !== 'reason')
    .filter(field => !field.isHidden)
    .map((field,
      index) => {
      // Permet de changer la clé devant être présente dans l'URI en ajoutant la propriété 'alias'
      const name = field.alias || field.key
      const formGroup = createFormGroup({
        autofocus: index === 0,
        ...field,
        name,
      })

      return formGroup
    })

  const reasonsData = formData
    .flat(1)
    .find(field => field.key === 'reason')

  const reasonFieldset = createReasonFieldset(reasonsData)
  appendToForm([...createTitle(), ...formFirstPart, reasonFieldset])
}